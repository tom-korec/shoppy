import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  archiveList,
  createItem,
  createList,
  listCategories,
} from '../support/shopping-fixtures.js';

describe('PATCH /api/entries/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('changes and clears the note', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const entry = await addEntry(app, user, (await createList(app, user)).id, { text: 'Milk' });

    const changed = await api('PATCH', `/entries/${entry.id}`, { note: '2 l' });
    const cleared = await api('PATCH', `/entries/${entry.id}`, { note: '' });

    expect(changed.json()).toMatchObject({ note: '2 l' });
    expect(cleared.json()).toMatchObject({ note: null });
  });

  it('moves a one-time entry to another category', async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);
    const entry = await addEntry(app, user, (await createList(app, user)).id, { text: 'Cake' });

    const res = await apiAs(app, user)('PATCH', `/entries/${entry.id}`, { categoryId: bakery?.id });

    expect(res.json()).toMatchObject({ categoryId: bakery?.id });
  });

  it('marks an entry checked and unchecked (shopping mode)', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const entry = await addEntry(app, user, (await createList(app, user)).id, { text: 'Milk' });

    const checked = await api('PATCH', `/entries/${entry.id}`, { isChecked: true });
    const unchecked = await api('PATCH', `/entries/${entry.id}`, { isChecked: false });

    expect(checked.json()).toMatchObject({ isChecked: true });
    expect(unchecked.json()).toMatchObject({ isChecked: false });
  });

  it('returns 400 when setting a category on a catalog entry', async () => {
    const user = await registerUser(app);
    const [, bakery] = await listCategories(app, user);
    const milk = await createItem(app, user, { name: 'Milk' });
    const entry = await addEntry(app, user, (await createList(app, user)).id, { itemId: milk.id });

    const res = await apiAs(app, user)('PATCH', `/entries/${entry.id}`, { categoryId: bakery?.id });

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's entry", async () => {
    const owner = await registerUser(app);
    const entry = await addEntry(app, owner, (await createList(app, owner)).id, { text: 'Milk' });

    const res = await apiAs(app, await registerUser(app))('PATCH', `/entries/${entry.id}`, {
      note: 'mine',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Milk' });
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('PATCH', `/entries/${entry.id}`, { note: '2 l' });

    expect(res.statusCode).toBe(409);
  });
});
