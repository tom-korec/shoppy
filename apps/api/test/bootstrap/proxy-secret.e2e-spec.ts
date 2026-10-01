import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PROXY_SECRET_HEADER } from '../../src/bootstrap/proxy-secret.hook.js';
import { createTestApp } from '../support/create-test-app.js';

const SECRET = 'x'.repeat(32);

describe('proxy secret', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp({
      env: { PROXY_SECRET: SECRET },
      prisma: { $queryRaw: () => Promise.resolve([1]) },
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects requests without the header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });

    expect(res.statusCode).toBe(403);
  });

  it('rejects requests with a wrong secret', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { [PROXY_SECRET_HEADER]: 'y'.repeat(32) },
    });

    expect(res.statusCode).toBe(403);
  });

  it('accepts requests with the secret', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { [PROXY_SECRET_HEADER]: SECRET },
    });

    expect(res.statusCode).toBe(200);
  });
});
