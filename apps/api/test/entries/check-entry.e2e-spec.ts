import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  archiveList,
  createItem,
  createList,
  listCategories,
  parseOk,
} from '../support/shopping-fixtures.js';

describe('POST /api/entries/:id/check', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('moves the entry into history with who bought it and when', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const [, , dairy] = await listCategories(app, user);
    const milk = await createItem(app, user, { name: 'Milk', categoryId: dairy?.id });
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { itemId: milk.id, note: '2 l' });

    const res = await api('POST', `/entries/${entry.id}/check`);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      listId: list.id,
      itemId: milk.id,
      name: 'Milk',
      categoryName: 'Dairy & eggs',
      note: '2 l',
      boughtBy: { id: user.user.id, displayName: 'Anna' },
    });
    expect(parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema).entries).toEqual([]);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Milk' });
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/check`);

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for another user's entry", async () => {
    const owner = await registerUser(app);
    const entry = await addEntry(app, owner, (await createList(app, owner)).id, { text: 'Milk' });

    const res = await apiAs(app, await registerUser(app))('POST', `/entries/${entry.id}/check`);

    expect(res.statusCode).toBe(404);
  });
});
