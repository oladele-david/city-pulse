import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaymentRecord, PaymentWebhookRecord } from 'src/domain/models';
import {
  paymentRecordFromPrisma,
  toPrismaPaymentStatus,
  toPrismaPaymentType,
} from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toInputJson(
    value?: Record<string, unknown>,
  ): Prisma.InputJsonValue | undefined {
    return value as Prisma.InputJsonValue | undefined;
  }

  async create(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: data.userId,
        reference: data.reference,
        paymentType: toPrismaPaymentType(data.paymentType),
        amount: data.amount,
        status: toPrismaPaymentStatus(data.status),
        checkoutUrl: data.checkoutUrl,
        providerReference: data.providerReference,
        metadata: this.toInputJson(data.metadata),
      },
    });

    return paymentRecordFromPrisma(payment);
  }

  async update(payment: PaymentRecord) {
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentType: toPrismaPaymentType(payment.paymentType),
        amount: payment.amount,
        status: toPrismaPaymentStatus(payment.status),
        checkoutUrl: payment.checkoutUrl,
        providerReference: payment.providerReference,
        metadata: this.toInputJson(payment.metadata),
        updatedAt: new Date(payment.updatedAt),
      },
    });

    return paymentRecordFromPrisma(updated);
  }

  async findByReference(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
    });

    return payment ? paymentRecordFromPrisma(payment) : undefined;
  }

  async listByUser(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(paymentRecordFromPrisma);
  }

  async listAll() {
    const payments = await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(paymentRecordFromPrisma);
  }

  async hasWebhookEvent(eventId: string) {
    const count = await this.prisma.paymentWebhook.count({
      where: { eventId },
    });

    return count > 0;
  }

  async createWebhook(data: Omit<PaymentWebhookRecord, 'id' | 'createdAt'>) {
    return this.prisma.paymentWebhook.create({
      data: {
        paymentId: data.paymentId,
        eventId: data.eventId,
        payload: data.payload as Prisma.InputJsonValue,
      },
    });
  }
}
