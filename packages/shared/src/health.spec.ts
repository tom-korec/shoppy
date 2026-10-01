import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('accepts a valid payload', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      version: '0.0.0',
      checks: { database: 'up' },
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown status', () => {
    const result = healthResponseSchema.safeParse({
      status: 'broken',
      version: '0.0.0',
      checks: { database: 'up' },
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
