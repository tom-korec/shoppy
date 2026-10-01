import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  createItem,
  createList,
  listCategories,
} from '../support/shopping-fixtures.js';

describe('GET /api/lists/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the list with its entries in the order they were added', async () => {
    const user = await registerUser(app);
    const [, , dairy, , , , , other] = await listCategories(app, user);
    const milk = await createItem(app, user, { name: 'Milk', categoryId: dairy?.id });
    const list = await createList(app, user);
    await addEntry(app, user, list.id, { itemId: milk.id, note: '2 l' });
    await addEntry(app, user, list.id, { text: 'Birthday candles', categoryId: other?.id });

    const res = await apiAs(app, user)('GET', `/lists/${list.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      name: 'Groceries',
      entryCount: 2,
      entries: [
        { itemId: milk.id, name: 'Milk', note: '2 l', categoryId: dairy?.id, isChecked: false },
        { itemId: null, name: 'Birthday candles', note: null, categoryId: other?.id },
      ],
    });
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('GET', `/lists/${list.id}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const res = await apiAs(app, await registerUser(app))('GET', '/lists/123');

    expect(res.statusCode).toBe(400);
  });
});
