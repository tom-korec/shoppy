import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';
import { categoryListSchema, DEFAULT_CATEGORIES } from '@shoppy/shared';

describe('POST /api/households', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('makes the creator the Owner and seeds the predefined categories', async () => {
    const owner = await registerUser(app);
    const api = apiAs(app, owner);

    const res = await api('POST', '/households', { name: ' Home ' });

    expect(res.statusCode).toBe(201);
    const household = res.json<{ id: string }>();
    expect(res.json()).toMatchObject({ name: 'Home', memberCount: 1, myRole: 'OWNER' });
    const categories = parseOk(
      await api('GET', `/scopes/households/${household.id}/categories`),
      categoryListSchema,
    );
    expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
  });

  it('returns 400 without a name', async () => {
    const res = await apiAs(app, await registerUser(app))('POST', '/households', { name: '' });

    expect(res.statusCode).toBe(400);
  });
});
