import { validateEnv } from './env.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

describe('validateEnv', () => {
  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env).toMatchObject({ NODE_ENV: 'development', PORT: 3000, LOG_LEVEL: 'info' });
  });

  it('treats empty optional values as unset', () => {
    const env = validateEnv({ ...base, SENTRY_DSN: '', PROXY_SECRET: '' });
    expect(env.SENTRY_DSN).toBeUndefined();
    expect(env.PROXY_SECRET).toBeUndefined();
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://localhost/db' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a short PROXY_SECRET', () => {
    expect(() => validateEnv({ ...base, PROXY_SECRET: 'short' })).toThrow(/PROXY_SECRET/);
  });
});
