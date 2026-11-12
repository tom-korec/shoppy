import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from '../support/create-test-app.js';

const LIST_ID = '01999d6c-6c4a-7c39-9a3f-000000000001';

describe('dashboard routes without a session', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['POST', '/api/me/favorites', { listId: LIST_ID }],
    ['DELETE', `/api/me/favorites/${LIST_ID}`, undefined],
    ['PUT', '/api/me/favorites/order', { ids: [LIST_ID] }],
    ['POST', `/api/lists/${LIST_ID}/visits`, undefined],
  ] as const)('%s %s answers 401', async (method, url, payload) => {
    const res = await app.inject({ method, url, ...(payload && { payload }) });

    expect(res.statusCode).toBe(401);
  });
});
