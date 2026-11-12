import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('DELETE /api/me/favorites/:listId', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('unstars a list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    await apiAs(app, user)('POST', '/me/favorites', { listId: list.id });

    const res = await apiAs(app, user)('DELETE', `/me/favorites/${list.id}`);

    expect(res.statusCode).toBe(204);
    const detail = parseOk(await apiAs(app, user)('GET', `/lists/${list.id}`), listDetailSchema);
    expect(detail.isFavorite).toBe(false);
  });

  it("leaves other users' favorites alone", async () => {
    const user = await registerUser(app);
    const other = await registerUser(app);
    const list = await createList(app, other);
    await apiAs(app, other)('POST', '/me/favorites', { listId: list.id });

    await apiAs(app, user)('DELETE', `/me/favorites/${list.id}`);

    const detail = parseOk(await apiAs(app, other)('GET', `/lists/${list.id}`), listDetailSchema);
    expect(detail.isFavorite).toBe(true);
  });

  it('rejects an invalid list id', async () => {
    const user = await registerUser(app);

    const res = await apiAs(app, user)('DELETE', '/me/favorites/nope');

    expect(res.statusCode).toBe(400);
  });
});
