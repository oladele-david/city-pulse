import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PaymentRecord, PaymentWebhookRecord } from 'src/domain/models';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: InMemoryDatabaseService) {}

  create(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const payment: PaymentRecord = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    this.db.payments.unshift(payment);
    return payment;
  }

  update(payment: PaymentRecord) {
    const index = this.db.payments.findIndex((item) => item.id === payment.id);
    this.db.payments[index] = payment;
    return payment;
  }

  findByReference(reference: string) {
    return this.db.payments.find((payment) => payment.reference === reference);
  }

  listByUser(userId: string) {
    return this.db.payments.filter((payment) => payment.userId === userId);
  }

  listAll() {
    return this.db.payments;
  }

  hasWebhookEvent(eventId: string) {
    return this.db.paymentWebhooks.some((event) => event.eventId === eventId);
  }

  createWebhook(data: Omit<PaymentWebhookRecord, 'id' | 'createdAt'>) {
    const webhook: PaymentWebhookRecord = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };
    this.db.paymentWebhooks.push(webhook);
    return webhook;
  }
}
