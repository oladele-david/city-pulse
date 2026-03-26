import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { PaymentsService } from 'src/payments/payments.service';

describe('PaymentsService', () => {
  function createService() {
    const paymentsRepository = {
      create: jest.fn(),
      createEvent: jest.fn(),
      findSuccessfulLevyPayment: jest.fn(),
      findByReference: jest.fn(),
      listByUser: jest.fn(),
      listAll: jest.fn(),
      createWebhook: jest.fn(),
      markWebhookProcessed: jest.fn(),
      update: jest.fn(),
    };
    const interswitchService = {
      getCheckoutConfig: jest.fn().mockReturnValue({
        provider: 'interswitch',
        method: 'inline',
        scriptUrl: 'https://newwebpay.qa.interswitchng.com/inline-checkout.js',
        request: {
          merchant_code: 'MX000000',
          pay_item_id: '0000000',
          pay_item_name: 'Levy',
          txn_ref: 'CP-LEVY-1',
          site_redirect_url: 'http://localhost:5173/payment/callback',
          amount: 1500000,
          currency: '566',
          cust_name: 'Demo Citizen',
          cust_email: 'citizen@citypulse.ng',
          cust_id: 'citizen-1',
          mode: 'TEST',
        },
      }),
      verifyWebhookSignature: jest.fn(),
      requery: jest.fn(),
      isSuccessfulResponse: jest.fn(),
      isPendingResponse: jest.fn(),
    };
    const usersRepository = {
      findById: jest.fn(),
    };
    const leviesService = {
      getCitizenLevyDetail: jest.fn(),
    };

    return {
      service: new PaymentsService(
        paymentsRepository as never,
        interswitchService as never,
        usersRepository as never,
        leviesService as never,
      ),
      paymentsRepository,
      interswitchService,
      usersRepository,
      leviesService,
    };
  }

  it('blocks duplicate successful levy payments for the same user and levy', async () => {
    const { service, paymentsRepository, usersRepository, leviesService } = createService();
    usersRepository.findById.mockResolvedValue({
      id: 'citizen-1',
      fullName: 'Demo Citizen',
    });
    leviesService.getCitizenLevyDetail.mockResolvedValue({
      id: 'levy-1',
      title: 'Quarterly sanitation levy',
      levyType: 'sanitation_levy',
      amount: 15000,
    });
    paymentsRepository.findSuccessfulLevyPayment.mockResolvedValue({ id: 'payment-1' });

    await expect(
      service.initializeLevyPayment('levy-1', {
        sub: 'citizen-1',
        email: 'citizen@citypulse.ng',
        role: 'citizen',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns duplicate_event for repeated webhook deliveries', async () => {
    const { service, paymentsRepository, interswitchService } = createService();
    interswitchService.verifyWebhookSignature.mockReturnValue(undefined);
    paymentsRepository.findByReference.mockResolvedValue({
      id: 'payment-1',
      reference: 'CP-LEVY-1',
    });
    paymentsRepository.createWebhook.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const result = await service.processWebhook(
      {
        event: 'TRANSACTION.COMPLETED',
        uuid: 'evt-1',
        data: { merchantReference: 'CP-LEVY-1' },
      },
      '{"event":"TRANSACTION.COMPLETED","uuid":"evt-1","data":{"merchantReference":"CP-LEVY-1"}}',
      'valid-signature',
    );

    expect(result).toEqual({
      reference: 'CP-LEVY-1',
      processed: false,
      reason: 'duplicate_event',
    });
  });

  it('keeps an initialized payment pending when requery says the transaction is still in progress', async () => {
    const { service, paymentsRepository, interswitchService } = createService();
    paymentsRepository.findByReference
      .mockResolvedValueOnce({
        id: 'payment-1',
        userId: 'citizen-1',
        reference: 'CP-LEVY-1',
        amount: 15000,
        status: 'initialized',
        paymentType: 'sanitation_levy',
        checkoutUrl: null,
        providerReference: null,
        gatewayProvider: 'interswitch',
        gatewayStatus: 'initialized',
        gatewayResponseCode: null,
        gatewayResponseDescription: null,
        providerPaymentReference: null,
        providerRetrievalReferenceNumber: null,
        providerTransactionDate: null,
        lastWebhookEventId: null,
        confirmedAt: null,
        failedAt: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        levy: null,
        user: { id: 'citizen-1', fullName: 'Demo Citizen', email: 'citizen@citypulse.ng' },
      })
      .mockResolvedValueOnce({
        id: 'payment-1',
        userId: 'citizen-1',
        reference: 'CP-LEVY-1',
        amount: 15000,
        status: 'initialized',
        paymentType: 'sanitation_levy',
        checkoutUrl: null,
        providerReference: null,
        gatewayProvider: 'interswitch',
        gatewayStatus: 'pending',
        gatewayResponseCode: '09',
        gatewayResponseDescription: 'Transaction in progress',
        providerPaymentReference: null,
        providerRetrievalReferenceNumber: null,
        providerTransactionDate: null,
        lastWebhookEventId: null,
        confirmedAt: null,
        failedAt: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        levy: null,
        user: { id: 'citizen-1', fullName: 'Demo Citizen', email: 'citizen@citypulse.ng' },
      });
    interswitchService.requery.mockResolvedValue({
      MerchantReference: 'CP-LEVY-1',
      ResponseCode: '09',
      ResponseDescription: 'Transaction in progress',
      Amount: 1500000,
    });
    interswitchService.isSuccessfulResponse.mockReturnValue(false);
    interswitchService.isPendingResponse.mockReturnValue(true);
    paymentsRepository.update.mockResolvedValue(undefined);
    paymentsRepository.createEvent.mockResolvedValue(undefined);

    const result = await service.getStatus('CP-LEVY-1', {
      sub: 'citizen-1',
      email: 'citizen@citypulse.ng',
      role: 'citizen',
    });

    expect(result.status).toBe('initialized');
    expect(result.gatewayStatus).toBe('pending');
  });
});
