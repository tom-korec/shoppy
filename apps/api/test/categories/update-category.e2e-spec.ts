import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, listCategories } from '../support/shopping-fixtures.js';

describe('PATCH /api/categories/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('renames and re-icons the category', async () => {
    const user = await registerUser(app);
    const [fruit] = await listCategories(app, user);

    const res = await apiAs(app, user)('PATCH', `/categories/${fruit?.id}`, {
      name: 'Fresh produce',
      icon: 'carrot',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ name: 'Fresh produce', icon: 'carrot' });
  });

  it('returns 409 when the new name is taken', async () => {
    const user = await registerUser(app);
    const [fruit] = await listCategories(app, user);

    const res = await apiAs(app, user)('PATCH', `/categories/${fruit?.id}`, { name: 'bakery' });

    expect(res.statusCode).toBe(409);
  });

  it('returns 400 for an empty name', async () => {
    const user = await registerUser(app);
    const [fruit] = await listCategories(app, user);

    const res = await apiAs(app, user)('PATCH', `/categories/${fruit?.id}`, { name: ' ' });

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's category", async () => {
    const [othersCategory] = await listCategories(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))(
      'PATCH',
      `/categories/${othersCategory?.id}`,
      { name: 'Mine' },
    );

    expect(res.statusCode).toBe(404);
  });
});
