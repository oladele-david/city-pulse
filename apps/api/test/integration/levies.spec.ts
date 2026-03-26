import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from 'src/common/interceptors/response-envelope.interceptor';
import { CloudinaryMediaService } from 'src/issues/cloudinary-media.service';

async function createApp(): Promise<INestApplication> {
  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  moduleBuilder.overrideProvider(CloudinaryMediaService).useValue({
    uploadIssueMedia: jest.fn(),
    uploadIssueMediaBatch: jest.fn(),
  });

  const moduleRef = await moduleBuilder.compile();

  const app = moduleRef.createNestApplication({ rawBody: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new UnprocessableEntityException({
          error: {
            code: 'validation_error',
            message: 'Request validation failed',
            details: errors.map((error) => ({
              field: error.property,
              message: Object.values(error.constraints ?? {})[0],
            })),
          },
        }),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  await app.init();
  return app;
}

async function login(app: INestApplication, role: 'admin' | 'citizen') {
  const credentials =
    role === 'admin'
      ? { email: 'admin@citypulse.ng', password: 'AdminPass123!' }
      : { email: 'citizen@citypulse.ng', password: 'CitizenPass123!' };

  const path = role === 'admin' ? '/api/v1/auth/admin/login' : '/api/v1/auth/citizen/login';
  const response = await request(app.getHttpServer()).post(path).send(credentials).expect(200);

  return response.body.data.accessToken as string;
}

async function publishLevy(app: INestApplication, levyId: string, adminToken: string) {
  await request(app.getHttpServer())
    .post(`/api/v1/admin/levies/${levyId}/publish`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(201);
}

function buildWebhookSignature(payload: string) {
  return createHmac(
    'sha512',
    process.env.INTERSWITCH_WEBHOOK_SECRET ?? 'citypulse-test-webhook-secret',
  )
    .update(payload)
    .digest('hex');
}

function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('Levy management and levy payment flow', () => {
  let app: INestApplication;
  let originalFetch: typeof global.fetch | undefined;

  jest.setTimeout(180000);

  beforeAll(() => {
    process.env.INTERSWITCH_WEBHOOK_SECRET =
      process.env.INTERSWITCH_WEBHOOK_SECRET ?? 'citypulse-test-webhook-secret';
  });

  beforeEach(async () => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    app = await createApp();
  });

  afterEach(async () => {
    global.fetch = originalFetch as typeof global.fetch;
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  it('rejects levy creation when both target ids are provided', async () => {
    const adminToken = await login(app, 'admin');

    const lgaLevy = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Illegal target levy',
        description: 'This should fail validation.',
        levyType: 'sanitation_levy',
        amount: 15000,
        dueDate: '2026-04-30T00:00:00.000Z',
        targetType: 'community',
        targetCommunityId: 'adeniran-ogunsanya',
        targetLgaId: 'surulere',
      })
      .expect(422);
  });

  it('lets citizens see only levies for their community or lga', async () => {
    const adminToken = await login(app, 'admin');
    const citizenToken = await login(app, 'citizen');
    const suffix = uniqueSuffix();

    const lgaLevy = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Surulere environmental levy ${suffix}`,
        description: 'LGA-wide levy for waste response.',
        levyType: 'environmental_fee',
        amount: 22000,
        dueDate: '2026-04-30T00:00:00.000Z',
        targetType: 'lga',
        targetLgaId: 'surulere',
      })
      .expect(201);
    await publishLevy(app, lgaLevy.body.data.id, adminToken);

    const communityLevy = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Adeniran Ogunsanya sanitation levy ${suffix}`,
        description: 'Community sanitation support.',
        levyType: 'sanitation_levy',
        amount: 18000,
        dueDate: '2026-05-10T00:00:00.000Z',
        targetType: 'community',
        targetCommunityId: 'adeniran-ogunsanya',
      })
      .expect(201);
    await publishLevy(app, communityLevy.body.data.id, adminToken);

    const outOfScopeLevy = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Ikeja-only levy ${suffix}`,
        description: 'Should not appear to Surulere citizen.',
        levyType: 'community_due',
        amount: 5000,
        dueDate: '2026-05-15T00:00:00.000Z',
        targetType: 'lga',
        targetLgaId: 'ikeja',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/levies/me')
      .set('Authorization', `Bearer ${citizenToken}`)
      .expect(200);

    const levyIds = response.body.data.map((levy: { id: string }) => levy.id);

    expect(levyIds).toEqual(
      expect.arrayContaining([lgaLevy.body.data.id, communityLevy.body.data.id]),
    );
    expect(levyIds).not.toContain(outOfScopeLevy.body.data.id);
  });

  it('initializes a levy payment and confirms success through signed webhook processing', async () => {
    const adminToken = await login(app, 'admin');
    const citizenToken = await login(app, 'citizen');
    const suffix = uniqueSuffix();

    const levyResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Quarterly sanitation levy ${suffix}`,
        description: 'Community cleaning contribution.',
        levyType: 'sanitation_levy',
        amount: 15000,
        dueDate: '2026-04-25T00:00:00.000Z',
        targetType: 'community',
        targetCommunityId: 'adeniran-ogunsanya',
      })
      .expect(201);

    const levyId = levyResponse.body.data.id as string;
    await publishLevy(app, levyId, adminToken);

    const initializeResponse = await request(app.getHttpServer())
      .post(`/api/v1/payments/levies/${levyId}/initialize`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({})
      .expect(201);

    const paymentReference = initializeResponse.body.data.reference as string;
    expect(initializeResponse.body.data.checkout.provider).toBe('interswitch');
    expect(initializeResponse.body.data.checkout.method).toBe('inline');
    expect(initializeResponse.body.data.checkout.request.txn_ref).toBe(paymentReference);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Amount: 1500000,
        MerchantReference: paymentReference,
        PaymentReference: 'FBN|WEB|MX6072|01-04-2026|3481032|762672',
        RetrievalReferenceNumber: '000106923853',
        TransactionDate: '2026-04-01T12:00:00.000Z',
        ResponseCode: '00',
        ResponseDescription: 'Approved by Financial Institution',
      }),
    });

    const webhookPayload = JSON.stringify({
      event: 'TRANSACTION.COMPLETED',
      uuid: `${paymentReference}-completed`,
      timestamp: 1775030400000,
      data: {
        amount: 1500000,
        paymentReference: 'FBN|WEB|MX6072|01-04-2026|3481032|762672',
        retrievalReferenceNumber: '000106923853',
        responseCode: '00',
        responseDescription: 'Approved by Financial Institution',
        merchantReference: paymentReference,
        currencyCode: '566',
        merchantCustomerId: 'citizen@citypulse.ng',
      },
    });

    const webhookResponse = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook')
      .set('X-Interswitch-Signature', buildWebhookSignature(webhookPayload))
      .set('Content-Type', 'application/json')
      .send(webhookPayload)
      .expect(200);

    expect(webhookResponse.body.data.processed).toBe(true);

    const statusResponse = await request(app.getHttpServer())
      .get(`/api/v1/payments/${paymentReference}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .expect(200);

    expect(statusResponse.body.data.status).toBe('succeeded');

    const duplicateResponse = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook')
      .set('X-Interswitch-Signature', buildWebhookSignature(webhookPayload))
      .set('Content-Type', 'application/json')
      .send(webhookPayload)
      .expect(200);

    expect(duplicateResponse.body.data.reason).toBe('duplicate_event');
  });

  it('keeps in-flight levy payments pending after a non-terminal requery response and exposes admin reporting totals', async () => {
    const adminToken = await login(app, 'admin');
    const citizenToken = await login(app, 'citizen');
    const suffix = uniqueSuffix();

    const levyResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/levies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Ward maintenance levy ${suffix}`,
        description: 'Routine ward maintenance support.',
        levyType: 'community_due',
        amount: 12500,
        dueDate: '2026-05-02T00:00:00.000Z',
        targetType: 'lga',
        targetLgaId: 'surulere',
      })
      .expect(201);

    const levyId = levyResponse.body.data.id as string;
    await publishLevy(app, levyId, adminToken);

    const initializeResponse = await request(app.getHttpServer())
      .post(`/api/v1/payments/levies/${levyId}/initialize`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({})
      .expect(201);

    const paymentReference = initializeResponse.body.data.reference as string;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Amount: 1250000,
        MerchantReference: paymentReference,
        PaymentReference: 'FBN|WEB|MX6072|02-04-2026|3481033|762673',
        RetrievalReferenceNumber: '000106923854',
        TransactionDate: '2026-04-02T08:00:00.000Z',
        ResponseCode: '09',
        ResponseDescription: 'Pending',
      }),
    });

    const statusResponse = await request(app.getHttpServer())
      .get(`/api/v1/payments/${paymentReference}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .expect(200);

    expect(statusResponse.body.data.status).toBe('initialized');
    expect(statusResponse.body.data.gatewayStatus).toBe('pending');

    const dashboardResponse = await request(app.getHttpServer())
      .get(`/api/v1/admin/levies/${levyId}/dashboard`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(dashboardResponse.body.data.totalCollectedAmount).toBe(0);
    expect(dashboardResponse.body.data.failedPaymentCount).toBe(0);
    expect(dashboardResponse.body.data.pendingPaymentCount).toBe(1);
    expect(dashboardResponse.body.data.payerCount).toBe(0);
  });
});
