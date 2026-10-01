import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { recentHistorySchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { daysAgo, insertPurchases } from '../support/history-fixtures.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('GET /api/lists/:listId/history/recent', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function recentHistory(purchaseAges: number[]) {
    const user = await registerUser(app);
    const list = await createList(app, user);
    await insertPurchases(
      app,
      list.id,
      purchaseAges.map((age) => ({ name: `${age} days ago`, boughtAt: daysAgo(age) })),
    );
    return parseOk(
      await apiAs(app, user)('GET', `/lists/${list.id}/history/recent`),
      recentHistorySchema,
    );
  }

  it('shows the last 7 days on a busy list', async () => {
    const recent = await recentHistory([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 10, 20]);

    expect(recent.windowDays).toBe(7);
    expect(recent.records).toHaveLength(10);
  });

  it('shows the last 30 days on a quiet list', async () => {
    const recent = await recentHistory([1, 2, 10, 20, 40]);

    expect(recent.windowDays).toBe(30);
    expect(recent.records.map(({ name }) => name)).toEqual([
      '1 days ago',
      '2 days ago',
      '10 days ago',
      '20 days ago',
    ]);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))(
      'GET',
      `/lists/${list.id}/history/recent`,
    );

    expect(res.statusCode).toBe(404);
  });
});
