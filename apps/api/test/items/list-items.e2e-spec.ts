import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createItem } from '../support/shopping-fixtures.js';

describe('GET /api/scopes/personal/items', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the user's catalog sorted by name", async () => {
    const user = await registerUser(app);
    await createItem(app, user, { name: 'Milk' });
    await createItem(app, user, { name: 'Bread', description: 'Wholemeal' });
    await createItem(app, await registerUser(app), { name: 'Not mine' });

    const res = await apiAs(app, user)('GET', '/scopes/personal/items');

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      expect.objectContaining({ name: 'Bread', description: 'Wholemeal', categoryId: null }),
      expect.objectContaining({ name: 'Milk', description: null }),
    ]);
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/scopes/personal/items' });

    expect(res.statusCode).toBe(401);
  });
});
