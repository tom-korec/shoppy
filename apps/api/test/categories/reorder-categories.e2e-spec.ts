import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, listCategories } from '../support/shopping-fixtures.js';

describe('POST /api/scopes/personal/categories/reorder', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('stores the new order', async () => {
    const user = await registerUser(app);
    const reversed = (await listCategories(app, user)).map(({ id }) => id).reverse();

    const res = await apiAs(app, user)('POST', '/scopes/personal/categories/reorder', {
      ids: reversed,
    });

    expect(res.statusCode).toBe(200);
    expect((await listCategories(app, user)).map(({ id }) => id)).toEqual(reversed);
  });

  it('returns 400 when a category is missing from the order', async () => {
    const user = await registerUser(app);
    const ids = (await listCategories(app, user)).map(({ id }) => id).slice(1);

    const res = await apiAs(app, user)('POST', '/scopes/personal/categories/reorder', { ids });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when the order contains another user's category", async () => {
    const user = await registerUser(app);
    const [othersCategory] = await listCategories(app, await registerUser(app));
    const ids = (await listCategories(app, user)).map(({ id }) => id);
    ids[0] = othersCategory?.id ?? '';

    const res = await apiAs(app, user)('POST', '/scopes/personal/categories/reorder', { ids });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a duplicated id', async () => {
    const user = await registerUser(app);
    const [first] = await listCategories(app, user);

    const res = await apiAs(app, user)('POST', '/scopes/personal/categories/reorder', {
      ids: [first?.id, first?.id],
    });

    expect(res.statusCode).toBe(400);
  });
});
