import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createItem, listCategories } from '../support/shopping-fixtures.js';

describe('PATCH /api/items/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('updates name, description and category', async () => {
    const user = await registerUser(app);
    const [, , dairy] = await listCategories(app, user);
    const item = await createItem(app, user, { name: 'Milk', description: 'Whole' });

    const res = await apiAs(app, user)('PATCH', `/items/${item.id}`, {
      name: 'Oat milk',
      description: '',
      categoryId: dairy?.id,
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      name: 'Oat milk',
      description: null,
      categoryId: dairy?.id,
    });
  });

  it('removes the category with null', async () => {
    const user = await registerUser(app);
    const [fruit] = await listCategories(app, user);
    const item = await createItem(app, user, { name: 'Apples', categoryId: fruit?.id });

    const res = await apiAs(app, user)('PATCH', `/items/${item.id}`, { categoryId: null });

    expect(res.json()).toMatchObject({ categoryId: null });
  });

  it('returns 409 when the new name is taken', async () => {
    const user = await registerUser(app);
    await createItem(app, user, { name: 'Milk' });
    const item = await createItem(app, user, { name: 'Bread' });

    const res = await apiAs(app, user)('PATCH', `/items/${item.id}`, { name: 'milk' });

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for another user's item", async () => {
    const item = await createItem(app, await registerUser(app), { name: 'Milk' });

    const res = await apiAs(app, await registerUser(app))('PATCH', `/items/${item.id}`, {
      name: 'Mine',
    });

    expect(res.statusCode).toBe(404);
  });
});
