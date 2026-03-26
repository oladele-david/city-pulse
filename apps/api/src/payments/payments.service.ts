import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { AuthUser } from 'src/domain/models';
import { UsersRepository } from 'src/users/users.repository';
import { LeviesService } from 'src/levies/levies.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { InterswitchRequeryResponse, InterswitchService } from './interswitch.service';
import { PaymentsRepository } from './payments.repository';

function notFound(message: string) {
  return new NotFoundException({
    error: {
      code: 'not_found',
      message,
      details: [],
    },
  });
}

function conflict(message: string) {
  return new ConflictException({
    error: {
      code: 'conflict',
      message,
      details: [],
    },
  });
}

function validationError(field: string, message: string) {
  return new UnprocessableEntityException({
    error: {
      code: 'validation_error',
      message: 'Request validation failed',
      details: [{ field, message }],
    },
  });
}

function toNumber(value: { toString(): string } | number | null | undefined) {
  return Number(value ?? 0);
}

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    levy: {
      include: {
        targetCommunity: {
          select: {
            id: true;
            name: true;
            lgaId: true;
          };
        };
        targetLga: {
          select: {
            id: true;
            name: true;
            stateId: true;
          };
        };
      };
    };
    user: {
      select: {
        id: true;
        fullName: true;
        email: true;
        lgaId: true;
        communityId: true;
      };
    };
  };
}>;

type PaymentHistoryEntry = Awaited<ReturnType<PaymentsRepository['listByUser']>>[number];
type AdminPaymentEntry = Awaited<ReturnType<PaymentsRepository['listAll']>>[number];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly interswitchService: InterswitchService,
    private readonly usersRepository: UsersRepository,
    private readonly leviesService: LeviesService,
  ) {}

  async initialize(dto: InitializePaymentDto, user: AuthUser) {
    const userProfile = await this.usersRepository.findById(user.sub);
    if (!userProfile) {
      throw notFound('Citizen not found');
    }

    const reference = this.generateReference('GEN');
    const checkout = this.interswitchService.getCheckoutConfig({
      reference,
      amountMajor: dto.amount,
      description: dto.description,
      user: {
        ...user,
        fullName: userProfile.fullName,
      },
    });

    const payment = await this.paymentsRepository.create({
      userId: user.sub,
      levyId: null,
      reference,
      paymentType: dto.paymentType,
      amount: dto.amount,
      status: 'initialized',
      checkoutUrl: checkout.scriptUrl,
      providerReference: undefined,
      gatewayProvider: 'interswitch',
      gatewayStatus: 'initialized',
      gatewayResponseCode: undefined,
      gatewayResponseDescription: undefined,
      providerPaymentReference: undefined,
      providerRetrievalReferenceNumber: undefined,
      providerTransactionDate: null,
      lastWebhookEventId: undefined,
      confirmedAt: null,
      failedAt: null,
      metadata: {
        description: dto.description,
        checkout,
      },
    });

    await this.paymentsRepository.createEvent({
      paymentId: payment.id,
      eventType: 'initialized',
      status: payment.status,
      payload: { source: 'payments.initialize' },
    });

    return {
      ...payment,
      checkout,
    };
  }

  async initializeLevyPayment(levyId: string, user: AuthUser) {
    const [citizen, levy] = await Promise.all([
      this.usersRepository.findById(user.sub),
      this.leviesService.getCitizenLevyDetail(levyId, user),
    ]);

    if (!citizen) {
      throw notFound('Citizen not found');
    }

    const existingSuccessfulPayment = await this.paymentsRepository.findSuccessfulLevyPayment(
      user.sub,
      levyId,
    );
    if (existingSuccessfulPayment) {
      throw conflict('Levy has already been paid successfully');
    }

    const reference = this.generateReference('LEVY');
    const checkout = this.interswitchService.getCheckoutConfig({
      reference,
      amountMajor: levy.amount,
      description: levy.title,
      user: {
        ...user,
        fullName: citizen.fullName,
      },
    });

    const payment = await this.paymentsRepository.create({
      userId: user.sub,
      levyId,
      reference,
      paymentType: levy.levyType,
      amount: levy.amount,
      status: 'initialized',
      checkoutUrl: checkout.scriptUrl,
      providerReference: undefined,
      gatewayProvider: 'interswitch',
      gatewayStatus: 'initialized',
      gatewayResponseCode: undefined,
      gatewayResponseDescription: undefined,
      providerPaymentReference: undefined,
      providerRetrievalReferenceNumber: undefined,
      providerTransactionDate: null,
      lastWebhookEventId: undefined,
      confirmedAt: null,
      failedAt: null,
      metadata: {
        levySnapshot: levy,
        checkout,
      },
    });

    await this.paymentsRepository.createEvent({
      paymentId: payment.id,
      eventType: 'initialized',
      status: payment.status,
      payload: { source: 'payments.initializeLevyPayment', levyId },
    });

    return {
      ...payment,
      levy,
      checkout,
    };
  }

  async getMyPayments(userId: string) {
    const payments = await this.paymentsRepository.listByUser(userId);
    return payments.map((payment) => this.serializePayment(payment));
  }

  async getStatus(reference: string, user?: AuthUser) {
    let payment = await this.requirePayment(reference, user);

    if (payment.status === PaymentStatus.initialized || payment.status === PaymentStatus.pending) {
      payment = await this.refreshPaymentStatus(payment, 'status_lookup');
    }

    return this.serializePayment(payment);
  }

  async getReceipt(reference: string, user?: AuthUser) {
    const payment = await this.getStatus(reference, user);
    return payment;
  }

  async listAll() {
    const payments = await this.paymentsRepository.listAll();
    return payments.map((payment) => this.serializePayment(payment));
  }

  async processWebhook(
    payload: Record<string, unknown>,
    rawBody: string,
    signature: string | undefined,
  ) {
    this.interswitchService.verifyWebhookSignature(rawBody, signature);

    const eventId = this.readString(payload.uuid);
    const eventName = this.readString(payload.event);
    const reference = this.readString(
      (payload.data as Record<string, unknown> | undefined)?.merchantReference,
    );

    if (!eventId || !reference) {
      return {
        processed: false,
        reason: 'ignored_event',
      };
    }

    const payment = await this.paymentsRepository.findByReference(reference);
    if (!payment) {
      return {
        reference,
        processed: false,
        reason: 'payment_not_found',
      };
    }

    let webhook;
    try {
      webhook = await this.paymentsRepository.createWebhook({
        paymentId: payment.id,
        eventId,
        eventName,
        signature,
        isSignatureValid: true,
        processedAt: null,
        payload,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          reference,
          processed: false,
          reason: 'duplicate_event',
        };
      }

      throw error;
    }

    await this.paymentsRepository.createEvent({
      paymentId: payment.id,
      eventType: 'webhook_received',
      status: payment.status,
      payload: {
        eventId,
        eventName,
      },
    });

    const updatedPayment =
      eventName === 'TRANSACTION.COMPLETED'
        ? await this.refreshPaymentStatus(payment, 'webhook', eventId, payload)
        : payment;

    await this.paymentsRepository.markWebhookProcessed(webhook.id);

    return {
      reference,
      processed: true,
      status: updatedPayment.status,
    };
  }

  private async requirePayment(reference: string, user?: AuthUser) {
    const payment = await this.paymentsRepository.findByReference(reference);
    if (!payment || (user && payment.userId !== user.sub && user.role !== 'admin')) {
      throw notFound('Payment not found');
    }

    return payment;
  }

  private async refreshPaymentStatus(
    payment: Awaited<ReturnType<PaymentsRepository['findByReference']>>,
    source: 'status_lookup' | 'webhook',
    webhookEventId?: string,
    webhookPayload?: Record<string, unknown>,
  ) {
    if (!payment) {
      throw notFound('Payment not found');
    }

    const response = await this.interswitchService.requery(
      payment.reference,
      toNumber(payment.amount),
    );

    const isSuccessful = this.interswitchService.isSuccessfulResponse(
      response,
      toNumber(payment.amount),
    );
    const merchantReferenceMatches =
      !response.MerchantReference || response.MerchantReference === payment.reference;
    const shouldStayPending =
      source === 'status_lookup' &&
      (!merchantReferenceMatches || this.interswitchService.isPendingResponse(response));
    const status = isSuccessful && merchantReferenceMatches
      ? 'succeeded'
      : shouldStayPending
        ? payment.status
        : 'failed';
    const gatewayStatus = shouldStayPending ? 'pending' : status;

    await this.paymentsRepository.update(payment.id, {
      status,
      providerReference: response.PaymentReference,
      gatewayStatus,
      gatewayResponseCode: response.ResponseCode,
      gatewayResponseDescription: response.ResponseDescription,
      providerPaymentReference: response.PaymentReference,
      providerRetrievalReferenceNumber: response.RetrievalReferenceNumber,
      providerTransactionDate: response.TransactionDate ?? null,
      lastWebhookEventId: webhookEventId,
      confirmedAt:
        status === 'succeeded'
          ? new Date().toISOString()
          : payment.confirmedAt?.toISOString?.() ?? null,
      failedAt:
        status === 'failed'
          ? new Date().toISOString()
          : shouldStayPending
            ? payment.failedAt?.toISOString?.() ?? null
            : null,
      metadata: this.buildUpdatedMetadata(payment.metadata, response, webhookPayload),
    });

    await this.paymentsRepository.createEvent({
      paymentId: payment.id,
      eventType: `${source}_confirmation`,
      status,
      payload: {
        responseCode: response.ResponseCode,
        responseDescription: response.ResponseDescription,
      },
    });

    const updated = await this.paymentsRepository.findByReference(payment.reference);
    if (!updated) {
      throw notFound('Payment not found');
    }

    return updated;
  }

  private buildUpdatedMetadata(
    existing: unknown,
    response: InterswitchRequeryResponse,
    webhookPayload?: Record<string, unknown>,
  ) {
    const base =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? (existing as Record<string, unknown>)
        : {};

    return {
      ...base,
      latestRequery: response,
      latestWebhook: webhookPayload ?? base.latestWebhook,
    };
  }

  private serializePayment(
    payment: PaymentWithRelations | PaymentHistoryEntry | AdminPaymentEntry,
  ) {
    const levy =
      payment.levy && 'description' in payment.levy
        ? {
            id: payment.levy.id,
            title: payment.levy.title,
            description: payment.levy.description,
            levyType: payment.levy.levyType,
            amount: toNumber(payment.levy.amount),
            dueDate: payment.levy.dueDate.toISOString(),
            targetType: payment.levy.targetType,
            targetCommunityId: payment.levy.targetCommunityId,
            targetLgaId: payment.levy.targetLgaId,
            status: payment.levy.status,
            targetCommunity: payment.levy.targetCommunity,
            targetLga: payment.levy.targetLga,
          }
        : payment.levy
          ? {
              id: payment.levy.id,
              title: payment.levy.title,
              targetType: payment.levy.targetType,
            }
          : undefined;

    return {
      id: payment.id,
      userId: payment.userId,
      levyId: payment.levyId,
      reference: payment.reference,
      paymentType: payment.paymentType,
      amount: toNumber(payment.amount),
      status: payment.status,
      checkoutUrl: payment.checkoutUrl ?? undefined,
      providerReference: payment.providerReference ?? undefined,
      gatewayProvider: payment.gatewayProvider,
      gatewayStatus: payment.gatewayStatus ?? undefined,
      gatewayResponseCode: payment.gatewayResponseCode ?? undefined,
      gatewayResponseDescription: payment.gatewayResponseDescription ?? undefined,
      providerPaymentReference: payment.providerPaymentReference ?? undefined,
      providerRetrievalReferenceNumber:
        payment.providerRetrievalReferenceNumber ?? undefined,
      providerTransactionDate: payment.providerTransactionDate?.toISOString?.() ?? null,
      lastWebhookEventId: payment.lastWebhookEventId ?? undefined,
      confirmedAt: payment.confirmedAt?.toISOString?.() ?? null,
      failedAt: payment.failedAt?.toISOString?.() ?? null,
      metadata:
        payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
          ? payment.metadata
          : undefined,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      levy,
      user: 'user' in payment ? payment.user : undefined,
    };
  }

  private generateReference(prefix: 'GEN' | 'LEVY') {
    return `CP-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  private readString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
}
