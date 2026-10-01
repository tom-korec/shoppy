import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { healthResponseSchema } from '@shoppy/shared';
import { createTestApp } from '../support/create-test-app.js';

describe('GET /api/health', () => {
  let app: NestFastifyApplication;

  afterEach(async () => {
    await app.close();
  });

  it('returns a valid health response', async () => {
    app = await createTestApp({ prisma: { $queryRaw: () => Promise.resolve([1]) } });

    const res = await app.inject({ method: 'GET', url: '/api/health' });

    expect(res.statusCode).toBe(200);
    expect(healthResponseSchema.parse(res.json()).status).toBe('ok');
  });

  it('stays 200 when the database is down', async () => {
    app = await createTestApp({
      prisma: { $queryRaw: () => Promise.reject(new Error('down')) },
    });

    const res = await app.inject({ method: 'GET', url: '/api/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'degraded' });
  });

  it('sets security headers', async () => {
    app = await createTestApp({ prisma: { $queryRaw: () => Promise.resolve([1]) } });

    const res = await app.inject({ method: 'GET', url: '/api/health' });

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
