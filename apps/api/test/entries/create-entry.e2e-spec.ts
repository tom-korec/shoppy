import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ENTRIES_MAX_PER_LIST, listDetailSchema, uuidV7 } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { insertRows } from '../support/insert-rows.js';
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

describe('POST /api/lists/:listId/entries', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("adds a catalog entry with the item's name and category", async () => {
    const user = await registerUser(app);
    const [, , dairy] = await listCategories(app, user);
    const milk = await createItem(app, user, { name: 'Milk', categoryId: dairy?.id });
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      itemId: milk.id,
      note: ' 2 l ',
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      itemId: milk.id,
      name: 'Milk',
      note: '2 l',
      categoryId: dairy?.id,
      isChecked: false,
    });
  });

  it('adds a one-time entry with its own category', async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      text: 'Birthday cake',
      categoryId: bakery?.id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      itemId: null,
      name: 'Birthday cake',
      categoryId: bakery?.id,
    });
  });

  it('allows the same item twice (FR-L10)', async () => {
    const user = await registerUser(app);
    const milk = await createItem(app, user, { name: 'Milk' });
    const list = await createList(app, user);
    await addEntry(app, user, list.id, { itemId: milk.id, note: 'whole' });

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      itemId: milk.id,
      note: 'skimmed',
    });

    expect(res.statusCode).toBe(201);
  });

  it('returns the same entry when a request with the same id is retried', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const id = uuidV7();
    await addEntry(app, user, list.id, { id, text: 'Milk' });

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, { id, text: 'Milk' });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ id, name: 'Milk' });
  });

  it('returns 409 for an id already used on another list', async () => {
    const user = await registerUser(app);
    const id = uuidV7();
    await addEntry(app, user, (await createList(app, user)).id, { id, text: 'Milk' });
    const otherList = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${otherList.id}/entries`, {
      id,
      text: 'Milk',
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 400 for a client id that is not time-ordered (UUIDv7)', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      id: '3f0d1c5e-8a4b-4c2d-9e6f-1a2b3c4d5e6f',
      text: 'Milk',
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 with both an item and a name', async () => {
    const user = await registerUser(app);
    const milk = await createItem(app, user, { name: 'Milk' });
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      itemId: milk.id,
      text: 'Milk',
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for another user's item (FR-L4)", async () => {
    const othersItem = await createItem(app, await registerUser(app), { name: 'Milk' });
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, {
      itemId: othersItem.id,
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, { text: 'Milk' });

    expect(res.statusCode).toBe(409);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('POST', `/lists/${list.id}/entries`, {
      text: 'Milk',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 409 when the list is full', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    await insertRows(app, 'entries', {
      ownerUserId: user.user.id,
      listId: list.id,
      count: ENTRIES_MAX_PER_LIST,
    });

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/entries`, { text: 'Milk' });

    expect(res.statusCode).toBe(409);
  });

  it("moves the list's last activity", async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    await addEntry(app, user, list.id, { text: 'Milk' });

    const updated = parseOk(await apiAs(app, user)('GET', `/lists/${list.id}`), listDetailSchema);
    expect(Date.parse(updated.lastActivityAt)).toBeGreaterThan(Date.parse(list.lastActivityAt));
  });
});
