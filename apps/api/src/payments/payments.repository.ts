import { Injectable } from '@nestjs/common';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { PaymentEventRecord, PaymentRecord, PaymentWebhookRecord } from 'src/domain/models';
import {
  paymentRecordFromPrisma,
  paymentWebhookRecordFromPrisma,
  toPrismaPaymentStatus,
  toPrismaPaymentType,
} from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toInputJson(value?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
    return value as Prisma.InputJsonValue | undefined;
  }

  async create(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const payment = await this.prisma.payment.create({
      data: {
        userId: data.userId,
        levyId: data.levyId ?? null,
        reference: data.reference,
        paymentType: toPrismaPaymentType(data.paymentType),
        amount: data.amount,
        status: toPrismaPaymentStatus(data.status),
        checkoutUrl: data.checkoutUrl,
        providerReference: data.providerReference,
        gatewayProvider: data.gatewayProvider,
        gatewayStatus: data.gatewayStatus,
        gatewayResponseCode: data.gatewayResponseCode,
        gatewayResponseDescription: data.gatewayResponseDescription,
        providerPaymentReference: data.providerPaymentReference,
        providerRetrievalReferenceNumber: data.providerRetrievalReferenceNumber,
        providerTransactionDate: data.providerTransactionDate
          ? new Date(data.providerTransactionDate)
          : undefined,
        lastWebhookEventId: data.lastWebhookEventId,
        confirmedAt: data.confirmedAt ? new Date(data.confirmedAt) : undefined,
        failedAt: data.failedAt ? new Date(data.failedAt) : undefined,
        metadata: this.toInputJson(data.metadata),
      },
    });

    return paymentRecordFromPrisma(payment);
  }

  async update(id: string, data: Partial<PaymentRecord>) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        levyId: data.levyId === undefined ? undefined : data.levyId,
        reference: data.reference,
        paymentType: data.paymentType ? toPrismaPaymentType(data.paymentType) : undefined,
        amount: data.amount,
        status: data.status ? toPrismaPaymentStatus(data.status) : undefined,
        checkoutUrl: data.checkoutUrl,
        providerReference: data.providerReference,
        gatewayProvider: data.gatewayProvider,
        gatewayStatus: data.gatewayStatus,
        gatewayResponseCode: data.gatewayResponseCode,
        gatewayResponseDescription: data.gatewayResponseDescription,
        providerPaymentReference: data.providerPaymentReference,
        providerRetrievalReferenceNumber: data.providerRetrievalReferenceNumber,
        providerTransactionDate: data.providerTransactionDate
          ? new Date(data.providerTransactionDate)
          : data.providerTransactionDate === null
            ? null
            : undefined,
        lastWebhookEventId: data.lastWebhookEventId,
        confirmedAt: data.confirmedAt
          ? new Date(data.confirmedAt)
          : data.confirmedAt === null
            ? null
            : undefined,
        failedAt:
          data.failedAt ? new Date(data.failedAt) : data.failedAt === null ? null : undefined,
        metadata: data.metadata ? this.toInputJson(data.metadata) : undefined,
      },
    });

    return paymentRecordFromPrisma(payment);
  }

  async findByReference(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
      include: {
        levy: {
          include: {
            targetCommunity: { select: { id: true, name: true, lgaId: true } },
            targetLga: { select: { id: true, name: true, stateId: true } },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            lgaId: true,
            communityId: true,
          },
        },
      },
    });

    return payment ?? undefined;
  }

  async findSuccessfulLevyPayment(userId: string, levyId: string) {
    return this.prisma.payment.findFirst({
      where: {
        userId,
        levyId,
        status: PaymentStatus.succeeded,
      },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        levy: {
          include: {
            targetCommunity: { select: { id: true, name: true, lgaId: true } },
            targetLga: { select: { id: true, name: true, stateId: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAll() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        levy: {
          select: {
            id: true,
            title: true,
            targetType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasWebhookEvent(eventId: string) {
    const count = await this.prisma.paymentWebhook.count({
      where: { eventId },
    });

    return count > 0;
  }

  async createWebhook(data: Omit<PaymentWebhookRecord, 'id' | 'createdAt'>) {
    const webhook = await this.prisma.paymentWebhook.create({
      data: {
        paymentId: data.paymentId,
        eventId: data.eventId,
        eventName: data.eventName,
        signature: data.signature,
        isSignatureValid: data.isSignatureValid,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
        payload: data.payload as Prisma.InputJsonValue,
      },
    });

    return paymentWebhookRecordFromPrisma(webhook);
  }

  async markWebhookProcessed(id: string) {
    const webhook = await this.prisma.paymentWebhook.update({
      where: { id },
      data: {
        processedAt: new Date(),
      },
    });

    return paymentWebhookRecordFromPrisma(webhook);
  }

  async createEvent(data: Omit<PaymentEventRecord, 'id' | 'createdAt'>) {
    return this.prisma.paymentEvent.create({
      data: {
        paymentId: data.paymentId,
        eventType: data.eventType,
        status: data.status ? toPrismaPaymentStatus(data.status) : undefined,
        payload: data.payload as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
