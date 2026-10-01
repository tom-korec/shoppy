import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { itemListSchema } from '@shoppy/shared';
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

describe('POST /api/entries/:id/promote', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a catalog item from a one-time entry and links the entry', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const [, bakery] = await listCategories(app, user);
    const entry = await addEntry(app, user, (await createList(app, user)).id, {
      text: 'Bagels',
      note: '6',
    });

    const res = await api('POST', `/entries/${entry.id}/promote`, { categoryId: bakery?.id });

    expect(res.statusCode).toBe(200);
    const [item] = parseOk(await api('GET', '/scopes/personal/items'), itemListSchema);
    expect(item).toMatchObject({ name: 'Bagels', categoryId: bakery?.id });
    expect(res.json()).toMatchObject({ itemId: item?.id, name: 'Bagels', note: '6' });
  });

  it("keeps the entry's own category when none is given", async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);
    const entry = await addEntry(app, user, (await createList(app, user)).id, {
      text: 'Bagels',
      categoryId: bakery?.id,
    });

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/promote`, {});

    expect(res.json()).toMatchObject({ categoryId: bakery?.id });
  });

  it('links an existing item with the same name instead of duplicating it', async () => {
    const user = await registerUser(app);
    const milk = await createItem(app, user, { name: 'Milk' });
    const entry = await addEntry(app, user, (await createList(app, user)).id, { text: 'milk' });

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/promote`, {});

    expect(res.json()).toMatchObject({ itemId: milk.id, name: 'Milk' });
  });

  it('treats % and _ in the name literally when looking for an existing item', async () => {
    const user = await registerUser(app);
    const milk = await createItem(app, user, { name: 'Milk' });
    const entry = await addEntry(app, user, (await createList(app, user)).id, { text: '_ilk' });

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/promote`, {});

    expect(res.json()).toMatchObject({ name: '_ilk' });
    expect(res.json()).not.toMatchObject({ itemId: milk.id });
  });

  it('returns 400 for an entry that is already in the catalog', async () => {
    const user = await registerUser(app);
    const milk = await createItem(app, user, { name: 'Milk' });
    const entry = await addEntry(app, user, (await createList(app, user)).id, { itemId: milk.id });

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/promote`, {});

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's entry", async () => {
    const owner = await registerUser(app);
    const entry = await addEntry(app, owner, (await createList(app, owner)).id, { text: 'Milk' });

    const res = await apiAs(app, await registerUser(app))(
      'POST',
      `/entries/${entry.id}/promote`,
      {},
    );

    expect(res.statusCode).toBe(404);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Bagels' });
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('POST', `/entries/${entry.id}/promote`, {});

    expect(res.statusCode).toBe(409);
  });
});
