import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('PATCH /api/me/list-view', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('saves grouping and sort', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('PATCH', '/me/list-view', { isGrouped: false, sort: 'CUSTOM' });

    expect(res.json()).toMatchObject({ isGrouped: false, sort: 'CUSTOM' });
    expect((await api('GET', '/me/list-view')).json()).toMatchObject({ isGrouped: false });
  });

  it('returns 400 for an unknown sort', async () => {
    const res = await apiAs(app, await registerUser(app))('PATCH', '/me/list-view', {
      sort: 'NAME',
    });

    expect(res.statusCode).toBe(400);
  });
});
