import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { dashboardSchema, FAVORITES_MAX_COUNT } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('PUT /api/me/favorites/order', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('saves the order, ignoring lists that are not favorites and keeping the missing ones last', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const [a, b, c] = [
      await createList(app, user, { name: 'A', icon: 'store' }),
      await createList(app, user, { name: 'B', icon: 'store' }),
      await createList(app, user, { name: 'C', icon: 'store' }),
    ];
    const notFavorite = await createList(app, user, { name: 'D', icon: 'store' });
    for (const list of [a, b, c]) await api('POST', '/me/favorites', { listId: list.id });

    const res = await api('PUT', '/me/favorites/order', { ids: [c.id, notFavorite.id, a.id] });

    expect(res.statusCode).toBe(204);
    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);
    expect(dashboard.favorites.map(({ name }) => name)).toEqual(['C', 'A', 'B']);
  });

  it('rejects more ids than favorites may exist', async () => {
    const user = await registerUser(app);
    const ids = Array.from(
      { length: FAVORITES_MAX_COUNT + 1 },
      (_, index) => `01999d6c-6c4a-7c39-9a3f-${String(index).padStart(12, '0')}`,
    );

    const res = await apiAs(app, user)('PUT', '/me/favorites/order', { ids });

    expect(res.statusCode).toBe(400);
  });

  it('rejects a list given twice', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('PUT', '/me/favorites/order', { ids: [list.id, list.id] });

    expect(res.statusCode).toBe(400);
  });
});
