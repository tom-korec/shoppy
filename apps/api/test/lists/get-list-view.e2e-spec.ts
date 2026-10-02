import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/me/list-view', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts grouped and sorted by last activity', async () => {
    const res = await apiAs(app, await registerUser(app))('GET', '/me/list-view');

    expect(res.json()).toEqual({ isGrouped: true, sort: 'ACTIVITY', customOrder: [] });
  });
});
