import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addEntry, apiAs, checkEntry, createList } from '../support/shopping-fixtures.js';

describe('DELETE /api/lists/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes the list with its entries and history', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    await checkEntry(app, user, (await addEntry(app, user, list.id, { text: 'Milk' })).id);

    const res = await api('DELETE', `/lists/${list.id}`);

    expect(res.statusCode).toBe(204);
    expect((await api('GET', `/lists/${list.id}`)).statusCode).toBe(404);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('DELETE', `/lists/${list.id}`);

    expect(res.statusCode).toBe(404);
  });
});
