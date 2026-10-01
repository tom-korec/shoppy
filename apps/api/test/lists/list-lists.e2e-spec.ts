import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addEntry, apiAs, archiveList, createList } from '../support/shopping-fixtures.js';

describe('GET /api/scopes/personal/lists', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the user's lists, newest first, with entry counts", async () => {
    const user = await registerUser(app);
    const groceries = await createList(app, user, { name: 'Groceries', icon: 'shopping-cart' });
    await addEntry(app, user, groceries.id, { text: 'Milk' });
    const party = await createList(app, user, { name: 'Party', icon: 'party-popper' });
    await archiveList(app, user, party.id);
    await createList(app, await registerUser(app));

    const res = await apiAs(app, user)('GET', '/scopes/personal/lists');

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      expect.objectContaining({ name: 'Party', isArchived: true, entryCount: 0 }),
      expect.objectContaining({ name: 'Groceries', isArchived: false, entryCount: 1 }),
    ]);
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/scopes/personal/lists' });

    expect(res.statusCode).toBe(401);
  });
});
