import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DEFAULT_CATEGORIES } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { createItem, listCategories } from '../support/shopping-fixtures.js';

describe('GET /api/scopes/personal/categories', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the seeded categories in order with their item counts', async () => {
    const user = await registerUser(app);
    const [fruit] = await listCategories(app, user);
    await createItem(app, user, { name: 'Apples', categoryId: fruit?.id });

    const categories = await listCategories(app, user);

    expect(categories.map(({ name }) => name)).toEqual(DEFAULT_CATEGORIES.map(({ name }) => name));
    expect(categories[0]).toMatchObject({ position: 0, itemCount: 1 });
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/scopes/personal/categories' });

    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for an unverified user', async () => {
    const user = await registerUser(app, { isVerified: false });

    const res = await app.inject({
      method: 'GET',
      url: '/api/scopes/personal/categories',
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(403);
  });
});
