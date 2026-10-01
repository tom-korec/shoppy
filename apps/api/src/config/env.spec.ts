import { validateEnv } from './env.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_SECRET: 'j'.repeat(32) };

describe('validateEnv', () => {
  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env).toMatchObject({ NODE_ENV: 'development', PORT: 3000, LOG_LEVEL: 'info' });
  });

  it('treats empty optional values as unset', () => {
    const env = validateEnv({ ...base, SENTRY_DSN: '', PROXY_SECRET: '', GOOGLE_CLIENT_ID: '' });
    expect(env.SENTRY_DSN).toBeUndefined();
    expect(env.PROXY_SECRET).toBeUndefined();
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => validateEnv({ ...base, DATABASE_URL: 'mysql://localhost/db' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('rejects a short PROXY_SECRET', () => {
    expect(() => validateEnv({ ...base, PROXY_SECRET: 'short' })).toThrow(/PROXY_SECRET/);
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('requires RESEND_API_KEY in production', () => {
    expect(() =>
      validateEnv({ ...base, NODE_ENV: 'production', PROXY_SECRET: 'p'.repeat(32) }),
    ).toThrow(/RESEND_API_KEY/);
  });

  it('requires PROXY_SECRET in production', () => {
    expect(() =>
      validateEnv({ ...base, NODE_ENV: 'production', RESEND_API_KEY: 're_key' }),
    ).toThrow(/PROXY_SECRET/);
  });
});
