const DEFAULT_CORS_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://city-pulse-lyart.vercel.app',
];

export function parseCorsOrigins(rawOrigins = process.env.CORS_ORIGIN): string[] {
  if (!rawOrigins?.trim()) {
    return DEFAULT_CORS_ORIGINS;
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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
