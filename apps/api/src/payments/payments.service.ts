import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/domain/models';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async initialize(dto: InitializePaymentDto, user: AuthUser) {
    const reference = `CP-${Date.now()}`;
    const payment = await this.paymentsRepository.create({
      userId: user.sub,
      reference,
      paymentType: dto.paymentType,
      amount: dto.amount,
      status: 'initialized',
      checkoutUrl: `${process.env.INTERSWITCH_BASE_URL ?? 'https://sandbox.interswitchng.com'}/checkout?reference=${reference}`,
      metadata: {
        description: dto.description,
        channel: 'web_checkout',
      },
    });

    return payment;
  }

  async getMyPayments(userId: string) {
    return this.paymentsRepository.listByUser(userId);
  }

  async getStatus(reference: string, user?: AuthUser) {
    const payment = await this.paymentsRepository.findByReference(reference);
    if (!payment || (user && payment.userId !== user.sub && user.role !== 'admin')) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Payment not found',
          details: [],
        },
      });
    }

    return payment;
  }

  async listAll() {
    return this.paymentsRepository.listAll();
  }

  async processWebhook(dto: PaymentWebhookDto) {
    const payment = await this.paymentsRepository.findByReference(dto.reference);
    if (!payment) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Payment not found',
          details: [],
        },
      });
    }

    if (await this.paymentsRepository.hasWebhookEvent(dto.eventId)) {
      return {
        reference: dto.reference,
        processed: false,
        reason: 'duplicate_event',
      };
    }

    payment.status = dto.status;
    payment.providerReference = dto.providerReference;
    payment.updatedAt = new Date().toISOString();
    await this.paymentsRepository.update(payment);
    await this.paymentsRepository.createWebhook({
      paymentId: payment.id,
      eventId: dto.eventId,
      payload: dto.payload ?? {},
    });

    return {
      reference: payment.reference,
      processed: true,
      status: payment.status,
    };
  }
}
