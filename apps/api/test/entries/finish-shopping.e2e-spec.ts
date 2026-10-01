import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addEntry, apiAs, archiveList, createList, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/lists/:listId/finish-shopping', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('moves only the checked entries into history', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const milk = await addEntry(app, user, list.id, { text: 'Milk' });
    await addEntry(app, user, list.id, { text: 'Bread' });
    const checked = await api('PATCH', `/entries/${milk.id}`, { isChecked: true });

    const res = await api('POST', `/lists/${list.id}/finish-shopping`);

    expect(res.json()).toEqual({ count: 1 });
    const detail = parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema);
    expect(detail.entries.map(({ name }) => name)).toEqual(['Bread']);
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toEqual([
      expect.objectContaining({
        name: 'Milk',
        boughtBy: { id: user.user.id, displayName: 'Anna' },
      }),
    ]);
    expect(checked.statusCode).toBe(200);
  });

  it('records each purchase once when Finish is sent twice at the same time', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    for (const text of ['Milk', 'Bread', 'Eggs']) {
      const entry = await addEntry(app, user, list.id, { text });
      await api('PATCH', `/entries/${entry.id}`, { isChecked: true });
    }

    const results = await Promise.all([
      api('POST', `/lists/${list.id}/finish-shopping`),
      api('POST', `/lists/${list.id}/finish-shopping`),
    ]);

    expect(results.map(({ statusCode }) => statusCode)).not.toContain(500);
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toHaveLength(3);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/finish-shopping`);

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))(
      'POST',
      `/lists/${list.id}/finish-shopping`,
    );

    expect(res.statusCode).toBe(404);
  });
});
