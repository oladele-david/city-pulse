const DEFAULT_CORS_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://city-pulse-lyart.vercel.app',
  'https://city-pulse-*.vercel.app',
];

function normalizeOrigin(origin: string): string {
  const trimmedOrigin = origin.trim();

  if (!trimmedOrigin) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedOrigin)) {
    return trimmedOrigin;
  }

  return `https://${trimmedOrigin}`;
}

export function parseCorsOrigins(rawOrigins = process.env.CORS_ORIGIN): string[] {
  const configuredOrigins = [
    rawOrigins,
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(','))
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  return [...new Set([...DEFAULT_CORS_ORIGINS, ...configuredOrigins])];
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin.includes('*')) {
      const pattern = new RegExp(
        `^${allowedOrigin
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')}$`,
      );

      return pattern.test(origin);
    }

    return allowedOrigin === origin;
  });
}

export function buildCorsOptions() {
  const allowedOrigins = parseCorsOrigins();

  return {
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin ?? 'unknown'}`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
}
