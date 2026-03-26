import {
  buildCorsOptions,
  isOriginAllowed,
  parseCorsOrigins,
} from 'src/config/cors.config';

describe('cors.config', () => {
  describe('parseCorsOrigins', () => {
    it('returns sane defaults when the env variable is missing', () => {
      expect(parseCorsOrigins(undefined)).toEqual([
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://city-pulse-lyart.vercel.app',
      ]);
    });

    it('parses a comma separated origin list', () => {
      expect(
        parseCorsOrigins(
          'https://city-pulse-lyart.vercel.app, https://*.vercel.app, http://localhost:8080',
        ),
      ).toEqual([
        'https://city-pulse-lyart.vercel.app',
        'https://*.vercel.app',
        'http://localhost:8080',
      ]);
    });
  });

  describe('isOriginAllowed', () => {
    it('allows requests without an origin header', () => {
      expect(isOriginAllowed(undefined, ['https://city-pulse-lyart.vercel.app'])).toBe(true);
    });

    it('allows exact origin matches', () => {
      expect(
        isOriginAllowed('https://city-pulse-lyart.vercel.app', [
          'https://city-pulse-lyart.vercel.app',
        ]),
      ).toBe(true);
    });

    it('allows wildcard origin matches', () => {
      expect(
        isOriginAllowed('https://city-pulse-preview-42.vercel.app', [
          'https://*.vercel.app',
        ]),
      ).toBe(true);
    });

    it('rejects origins outside the allowlist', () => {
      expect(
        isOriginAllowed('https://malicious.example.com', [
          'https://city-pulse-lyart.vercel.app',
          'https://*.vercel.app',
        ]),
      ).toBe(false);
    });
  });

  describe('buildCorsOptions', () => {
    it('accepts allowed origins via the cors callback', () => {
      const options = buildCorsOptions();
      const callback = jest.fn();

      options.origin('https://city-pulse-lyart.vercel.app', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('rejects disallowed origins via the cors callback', () => {
      const options = buildCorsOptions();
      const callback = jest.fn();

      options.origin('https://malicious.example.com', callback);

      expect(callback.mock.calls[0]?.[0]).toBeInstanceOf(Error);
      expect(callback.mock.calls[0]?.[1]).toBeUndefined();
    });
  });
});
