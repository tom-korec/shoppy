import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ITEMS_MAX_COUNT } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { insertRows } from '../support/insert-rows.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createItem, listCategories } from '../support/shopping-fixtures.js';

describe('POST /api/scopes/personal/items', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an item in a category', async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);

    const res = await apiAs(app, user)('POST', '/scopes/personal/items', {
      name: ' Rye bread ',
      description: '  ',
      categoryId: bakery?.id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      name: 'Rye bread',
      description: null,
      categoryId: bakery?.id,
    });
  });

  it('returns 409 for a name that exists in any letter case', async () => {
    const user = await registerUser(app);
    await createItem(app, user, { name: 'Milk' });

    const res = await apiAs(app, user)('POST', '/scopes/personal/items', { name: 'MILK' });

    expect(res.statusCode).toBe(409);
  });

  it("returns 400 for another user's category", async () => {
    const [othersCategory] = await listCategories(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('POST', '/scopes/personal/items', {
      name: 'Milk',
      categoryId: othersCategory?.id,
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for an empty name', async () => {
    const res = await apiAs(app, await registerUser(app))('POST', '/scopes/personal/items', {
      name: '',
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 at the size limit', async () => {
    const user = await registerUser(app);
    await insertRows(app, 'items', { ownerUserId: user.user.id, count: ITEMS_MAX_COUNT });

    const res = await apiAs(app, user)('POST', '/scopes/personal/items', { name: 'One more' });

    expect(res.statusCode).toBe(409);
  });
});
