import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { daysAgo, insertPurchases } from '../support/history-fixtures.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('GET /api/lists/:listId/history', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('pages through all records, newest first', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    await insertPurchases(
      app,
      list.id,
      ['A', 'B', 'C', 'D', 'E'].map((name, index) => ({ name, boughtAt: daysAgo(40 + index) })),
    );

    const first = parseOk(await api('GET', `/lists/${list.id}/history?limit=2`), historyPageSchema);
    const second = parseOk(
      await api('GET', `/lists/${list.id}/history?limit=2&cursor=${first.nextCursor}`),
      historyPageSchema,
    );
    const third = parseOk(
      await api('GET', `/lists/${list.id}/history?limit=2&cursor=${second.nextCursor}`),
      historyPageSchema,
    );

    expect(first.records.map(({ name }) => name)).toEqual(['A', 'B']);
    expect(second.records.map(({ name }) => name)).toEqual(['C', 'D']);
    expect(third).toMatchObject({ records: [{ name: 'E' }], nextCursor: null });
  });

  it('returns 400 for an invalid cursor', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('GET', `/lists/${list.id}/history?cursor=bogus`);

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a page size over the limit', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('GET', `/lists/${list.id}/history?limit=1000`);

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('GET', `/lists/${list.id}/history`);

    expect(res.statusCode).toBe(404);
  });
});
