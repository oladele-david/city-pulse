export type InterswitchMode = 'TEST' | 'LIVE';

export interface InterswitchConfig {
  merchantCode: string;
  payItemId: string;
  dataRef?: string;
  clientId?: string;
  secretKey?: string;
  webhookSecret?: string;
  redirectUrl: string;
  webhookUrl?: string;
  mode: InterswitchMode;
  baseUrl: string;
  requeryBaseUrl: string;
  inlineScriptUrl: string;
}

function normalizeMode(mode: string | undefined): InterswitchMode {
  return mode?.toUpperCase() === 'LIVE' ? 'LIVE' : 'TEST';
}

function normalizeUrl(value: string | undefined, fallback: string) {
  return (value?.trim() || fallback).replace(/\/$/, '');
}

export function getInterswitchConfig(): InterswitchConfig {
  const mode = normalizeMode(process.env.INTERSWITCH_MODE);
  const baseUrl = normalizeUrl(
    process.env.INTERSWITCH_BASE_URL,
    mode === 'LIVE'
      ? 'https://newwebpay.interswitchng.com'
      : 'https://newwebpay.qa.interswitchng.com',
  );
  const requeryBaseUrl = normalizeUrl(
    process.env.INTERSWITCH_REQUERY_BASE_URL,
    mode === 'LIVE' ? 'https://webpay.interswitchng.com' : 'https://qa.interswitchng.com',
  );

  return {
    merchantCode: process.env.INTERSWITCH_MERCHANT_CODE ?? '',
    payItemId: process.env.INTERSWITCH_PAY_ITEM_ID ?? '',
    dataRef: process.env.INTERSWITCH_DATA_REF,
    clientId: process.env.INTERSWITCH_CLIENT_ID,
    secretKey: process.env.INTERSWITCH_SECRET_KEY,
    webhookSecret: process.env.INTERSWITCH_WEBHOOK_SECRET,
    redirectUrl:
      process.env.INTERSWITCH_REDIRECT_URL ??
      `${(process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')}/payment/callback`,
    webhookUrl: process.env.INTERSWITCH_WEBHOOK_URL,
    mode,
    baseUrl,
    requeryBaseUrl,
    inlineScriptUrl: `${baseUrl}/inline-checkout.js`,
  };
}
