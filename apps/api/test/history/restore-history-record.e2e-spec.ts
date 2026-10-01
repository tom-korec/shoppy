import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, uuidV7 } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  archiveList,
  checkEntry,
  createItem,
  createList,
  listCategories,
  parseOk,
} from '../support/shopping-fixtures.js';

describe('POST /api/history/:id/restore', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('moves a catalog purchase back onto the list with the chosen entry id', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const milk = await createItem(app, user, { name: 'Milk' });
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { itemId: milk.id, note: '2 l' });
    const record = await checkEntry(app, user, entry.id);
    const entryId = uuidV7();

    const res = await api('POST', `/history/${record.id}/restore`, { entryId });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id: entryId, itemId: milk.id, name: 'Milk', note: '2 l' });
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toEqual([]);
  });

  it('restores a one-time purchase into the category of the same name', async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Cake', categoryId: bakery?.id });
    const record = await checkEntry(app, user, entry.id);

    const res = await apiAs(app, user)('POST', `/history/${record.id}/restore`, {});

    expect(res.json()).toMatchObject({ itemId: null, name: 'Cake', categoryId: bakery?.id });
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const record = await checkEntry(
      app,
      user,
      (await addEntry(app, user, list.id, { text: 'Milk' })).id,
    );
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('POST', `/history/${record.id}/restore`, {});

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for another user's record", async () => {
    const owner = await registerUser(app);
    const list = await createList(app, owner);
    const record = await checkEntry(
      app,
      owner,
      (await addEntry(app, owner, list.id, { text: 'Milk' })).id,
    );

    const res = await apiAs(app, await registerUser(app))(
      'POST',
      `/history/${record.id}/restore`,
      {},
    );

    expect(res.statusCode).toBe(404);
  });
});
