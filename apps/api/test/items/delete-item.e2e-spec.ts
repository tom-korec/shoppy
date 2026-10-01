import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  checkEntry,
  createItem,
  createList,
  listCategories,
  parseOk,
} from '../support/shopping-fixtures.js';

describe('DELETE /api/items/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('turns entries of the item into one-time entries and keeps history', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const [, , dairy] = await listCategories(app, user);
    const item = await createItem(app, user, { name: 'Milk', categoryId: dairy?.id });
    const list = await createList(app, user);
    await addEntry(app, user, list.id, { itemId: item.id, note: '2 l' });
    await checkEntry(app, user, (await addEntry(app, user, list.id, { itemId: item.id })).id);

    const res = await api('DELETE', `/items/${item.id}`);

    expect(res.statusCode).toBe(204);
    const detail = parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema);
    expect(detail.entries).toEqual([
      expect.objectContaining({ itemId: null, name: 'Milk', note: '2 l', categoryId: dairy?.id }),
    ]);
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toEqual([
      expect.objectContaining({ itemId: null, name: 'Milk', categoryName: 'Dairy & eggs' }),
    ]);
  });

  it("returns 404 for another user's item", async () => {
    const item = await createItem(app, await registerUser(app), { name: 'Milk' });

    const res = await apiAs(app, await registerUser(app))('DELETE', `/items/${item.id}`);

    expect(res.statusCode).toBe(404);
  });
});
