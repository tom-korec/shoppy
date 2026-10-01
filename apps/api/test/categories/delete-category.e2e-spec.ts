import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { itemListSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createItem, listCategories, parseOk } from '../support/shopping-fixtures.js';

describe('DELETE /api/categories/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes the category and leaves its items uncategorized', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const [fruit] = await listCategories(app, user);
    await createItem(app, user, { name: 'Apples', categoryId: fruit?.id });

    const res = await api('DELETE', `/categories/${fruit?.id}`);

    expect(res.statusCode).toBe(204);
    expect(await listCategories(app, user)).toHaveLength(7);
    const items = parseOk(await api('GET', '/scopes/personal/items'), itemListSchema);
    expect(items[0]).toMatchObject({ name: 'Apples', categoryId: null });
  });

  it("returns 404 for another user's category", async () => {
    const [othersCategory] = await listCategories(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))(
      'DELETE',
      `/categories/${othersCategory?.id}`,
    );

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const res = await apiAs(app, await registerUser(app))('DELETE', '/categories/not-an-id');

    expect(res.statusCode).toBe(400);
  });
});
