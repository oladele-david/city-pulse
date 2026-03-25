import { INestApplication, UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from 'src/common/interceptors/response-envelope.interceptor';

async function createApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
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

describe('CityPulse API integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a citizen, logs in, and returns /auth/me', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/citizen/register')
      .send({
        fullName: 'Aisha Bello',
        email: 'aisha@example.com',
        password: 'StrongPass123!',
        lgaId: 'ikeja',
        communityId: 'alausa',
        streetOrArea: 'Obafemi Awolowo Way',
      })
      .expect(201);

    expect(registerResponse.body.data.user.role).toBe('citizen');

    const token = registerResponse.body.data.accessToken;
    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body.data.email).toBe('aisha@example.com');
  });

  it('creates an issue, reads it publicly, and switches reactions', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/citizen/login')
      .send({
        email: 'citizen@citypulse.ng',
        password: 'CitizenPass123!',
      })
      .expect(200);

    const token = loginResponse.body.data.accessToken;

    const issueResponse = await request(app.getHttpServer())
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'drainage',
        title: 'Flooded drainage by community clinic',
        description:
          'Blocked drainage channel is overflowing beside the clinic entrance',
        severity: 'high',
        lgaId: 'surulere',
        communityId: 'adeniran-ogunsanya',
        streetOrLandmark: 'Clinic Road',
        latitude: 6.5001,
        longitude: 3.3525,
        photoUrl: 'https://example.com/flood.jpg',
      })
      .expect(201);

    const issueId = issueResponse.body.data.id;

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/issues')
      .expect(200);

    expect(listResponse.body.data[0].id).toBe(issueId);

    const confirmResponse = await request(app.getHttpServer())
      .put(`/api/v1/issues/${issueId}/reaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reaction: 'confirm' })
      .expect(200);

    expect(confirmResponse.body.data.reaction).toBe('confirm');
    expect(confirmResponse.body.data.counts.confirmationsCount).toBe(1);

    const switchResponse = await request(app.getHttpServer())
      .put(`/api/v1/issues/${issueId}/reaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reaction: 'fixed_signal' })
      .expect(200);

    expect(switchResponse.body.data.reaction).toBe('fixed_signal');
    expect(switchResponse.body.data.counts.confirmationsCount).toBe(0);
  });

  it('resolves public guest location requests', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/locations/resolve')
      .send({
        latitude: 6.6212,
        longitude: 3.3579,
      })
      .expect(200);

    expect(response.body.data.state.id).toBe('lagos');
    expect(response.body.data.community.id).toBe('alausa');
  });

  it('initializes payments, exposes status, and handles webhook idempotently', async () => {
    const citizenLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/citizen/login')
      .send({
        email: 'citizen@citypulse.ng',
        password: 'CitizenPass123!',
      })
      .expect(200);
    const citizenToken = citizenLogin.body.data.accessToken;

    const paymentResponse = await request(app.getHttpServer())
      .post('/api/v1/payments/initialize')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        paymentType: 'sanitation_levy',
        amount: 15000,
        description: 'Q2 sanitation levy',
      })
      .expect(201);

    const reference = paymentResponse.body.data.reference;

    const statusResponse = await request(app.getHttpServer())
      .get(`/api/v1/payments/${reference}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .expect(200);

    expect(statusResponse.body.data.status).toBe('initialized');

    const webhookResponse = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook')
      .send({
        eventId: 'evt-1',
        reference,
        status: 'succeeded',
        providerReference: 'isw-123',
      })
      .expect(200);

    expect(webhookResponse.body.data.processed).toBe(true);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/api/v1/payments/webhook')
      .send({
        eventId: 'evt-1',
        reference,
        status: 'succeeded',
      })
      .expect(200);

    expect(duplicateResponse.body.data.reason).toBe('duplicate_event');
  });

  it('lets admins update issue status and view analytics', async () => {
    const citizenLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/citizen/login')
      .send({
        email: 'citizen@citypulse.ng',
        password: 'CitizenPass123!',
      });
    const citizenToken = citizenLogin.body.data.accessToken;

    const issueResponse = await request(app.getHttpServer())
      .post('/api/v1/issues')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        type: 'road',
        title: 'Collapsed shoulder near bus stop',
        description:
          'The road shoulder has caved in near the bus stop, slowing traffic heavily',
        severity: 'medium',
        lgaId: 'ikeja',
        communityId: 'alausa',
        streetOrLandmark: 'Secretariat Bus Stop',
        latitude: 6.6211,
        longitude: 3.358,
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/admin/login')
      .send({
        email: 'admin@citypulse.ng',
        password: 'AdminPass123!',
      })
      .expect(200);
    const adminToken = adminLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .patch(`/api/v1/issues/${issueResponse.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' })
      .expect(200);

    const analyticsResponse = await request(app.getHttpServer())
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(analyticsResponse.body.data.issues.total).toBeGreaterThan(0);
  });
});
