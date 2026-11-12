import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { dashboardSchema, FAVORITES_MAX_COUNT, listDetailSchema } from '@shoppy/shared';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { insertRows } from '../support/insert-rows.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/me/favorites', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('stars a list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', '/me/favorites', { listId: list.id });

    expect(res.statusCode).toBe(204);
    const detail = parseOk(await apiAs(app, user)('GET', `/lists/${list.id}`), listDetailSchema);
    expect(detail.isFavorite).toBe(true);
  });

  it('adds new favorites last and keeps the place of one starred again', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const first = await createList(app, user, { name: 'First', icon: 'store' });
    const second = await createList(app, user, { name: 'Second', icon: 'store' });
    await api('POST', '/me/favorites', { listId: first.id });
    await api('POST', '/me/favorites', { listId: second.id });

    await api('POST', '/me/favorites', { listId: first.id });

    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);
    expect(dashboard.favorites.map(({ name }) => name)).toEqual(['First', 'Second']);
  });

  it('stops at the favorites limit', async () => {
    const user = await registerUser(app);
    await insertRows(app, 'lists', { ownerUserId: user.user.id, count: FAVORITES_MAX_COUNT });
    const prisma = app.get(PrismaService);
    const filler = await prisma.list.findMany({ where: { ownerUserId: user.user.id } });
    await prisma.favoriteList.createMany({
      data: filler.map((list, position) => ({ userId: user.user.id, listId: list.id, position })),
    });
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', '/me/favorites', { listId: list.id });

    expect(res.statusCode).toBe(409);
  });

  it("answers 404 for another user's list", async () => {
    const user = await registerUser(app);
    const foreign = await createList(app, await registerUser(app));

    const res = await apiAs(app, user)('POST', '/me/favorites', { listId: foreign.id });

    expect(res.statusCode).toBe(404);
  });

  it('rejects an invalid list id', async () => {
    const user = await registerUser(app);

    const res = await apiAs(app, user)('POST', '/me/favorites', { listId: 'nope' });

    expect(res.statusCode).toBe(400);
  });
});
