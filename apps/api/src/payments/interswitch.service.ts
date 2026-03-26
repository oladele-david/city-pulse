import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AuthUser } from 'src/domain/models';
import { getInterswitchConfig } from './interswitch.config';

export interface InterswitchRequeryResponse {
  Amount?: number;
  MerchantReference?: string;
  PaymentReference?: string;
  RetrievalReferenceNumber?: string;
  TransactionDate?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
}

@Injectable()
export class InterswitchService {
  getCheckoutConfig(args: {
    reference: string;
    amountMajor: number;
    description: string;
    user: AuthUser & { fullName?: string };
  }) {
    const config = getInterswitchConfig();
    this.assertConfigured();

    return {
      provider: 'interswitch',
      method: 'inline',
      scriptUrl: config.inlineScriptUrl,
      request: {
        merchant_code: config.merchantCode,
        pay_item_id: config.payItemId,
        pay_item_name: args.description,
        txn_ref: args.reference,
        site_redirect_url: config.redirectUrl,
        amount: this.toMinorUnits(args.amountMajor),
        currency: '566',
        cust_name: args.user.fullName ?? args.user.email,
        cust_email: args.user.email,
        cust_id: args.user.sub,
        mode: config.mode,
      },
    };
  }

  async requery(reference: string, amountMajor: number) {
    const config = getInterswitchConfig();
    this.assertConfigured();

    const url = new URL(`${config.requeryBaseUrl}/collections/api/v1/gettransaction.json`);
    url.searchParams.set('merchantcode', config.merchantCode);
    url.searchParams.set('transactionreference', reference);
    url.searchParams.set('amount', String(this.toMinorUnits(amountMajor)));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException({
        error: {
          code: 'payment_requery_failed',
          message: 'Could not confirm payment status',
          details: [],
        },
      });
    }

    return (await response.json()) as InterswitchRequeryResponse;
  }

  verifyWebhookSignature(rawBody: string, signature: string | undefined) {
    const webhookSecret = getInterswitchConfig().webhookSecret;
    if (!webhookSecret || !signature) {
      throw new UnauthorizedException({
        error: {
          code: 'invalid_webhook_signature',
          message: 'Invalid webhook signature',
          details: [],
        },
      });
    }

    const expected = createHmac('sha512', webhookSecret).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      throw new UnauthorizedException({
        error: {
          code: 'invalid_webhook_signature',
          message: 'Invalid webhook signature',
          details: [],
        },
      });
    }
  }

  isSuccessfulResponse(response: InterswitchRequeryResponse, expectedAmountMajor: number) {
    return (
      response.ResponseCode === '00' &&
      Number(response.Amount ?? 0) === this.toMinorUnits(expectedAmountMajor)
    );
  }

  isPendingResponse(response: InterswitchRequeryResponse) {
    return !response.ResponseCode || response.ResponseCode === '09';
  }

  toMinorUnits(amountMajor: number) {
    return Math.round(amountMajor * 100);
  }

  private assertConfigured() {
    const config = getInterswitchConfig();
    if (!config.merchantCode || !config.payItemId) {
      throw new InternalServerErrorException({
        error: {
          code: 'payment_provider_not_configured',
          message: 'Interswitch payment configuration is incomplete',
          details: [],
        },
      });
    }
  }
}
