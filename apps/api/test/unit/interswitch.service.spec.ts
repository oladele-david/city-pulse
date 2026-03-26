import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { InterswitchService } from 'src/payments/interswitch.service';

describe('InterswitchService', () => {
  const service = new InterswitchService();

  beforeEach(() => {
    process.env.INTERSWITCH_MERCHANT_CODE = 'MX000000';
    process.env.INTERSWITCH_PAY_ITEM_ID = '0000000';
    process.env.INTERSWITCH_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  it('verifies valid webhook signatures', () => {
    const payload = JSON.stringify({
      event: 'TRANSACTION.COMPLETED',
      uuid: 'evt-1',
      data: { merchantReference: 'CP-LEVY-1' },
    });
    const signature = createHmac('sha512', process.env.INTERSWITCH_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');

    expect(() => service.verifyWebhookSignature(payload, signature)).not.toThrow();
  });

  it('rejects invalid webhook signatures', () => {
    expect(() =>
      service.verifyWebhookSignature('{"ok":true}', 'bad-signature'),
    ).toThrow(UnauthorizedException);
  });

  it('confirms successful requery responses only when code and amount match', () => {
    expect(
      service.isSuccessfulResponse(
        {
          ResponseCode: '00',
          Amount: 1500000,
        },
        15000,
      ),
    ).toBe(true);

    expect(
      service.isSuccessfulResponse(
        {
          ResponseCode: '00',
          Amount: 1400000,
        },
        15000,
      ),
    ).toBe(false);
  });
});
