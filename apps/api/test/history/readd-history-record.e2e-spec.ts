import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, uuidV7 } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addEntry,
  apiAs,
  archiveList,
  checkEntry,
  createList,
  parseOk,
} from '../support/shopping-fixtures.js';

describe('POST /api/history/:id/readd', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds a copy to the list and keeps the record', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const record = await checkEntry(
      app,
      user,
      (await addEntry(app, user, list.id, { text: 'Milk' })).id,
    );

    const res = await api('POST', `/history/${record.id}/readd`, {});

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ name: 'Milk', listId: list.id });
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toHaveLength(1);
  });

  it('returns the same entry when a request with the same entry id is retried', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const record = await checkEntry(
      app,
      user,
      (await addEntry(app, user, list.id, { text: 'Milk' })).id,
    );
    const entryId = uuidV7();
    await api('POST', `/history/${record.id}/readd`, { entryId });

    const res = await api('POST', `/history/${record.id}/readd`, { entryId });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id: entryId, name: 'Milk' });
  });

  it('returns 400 for an entry id that is not a UUID', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const record = await checkEntry(
      app,
      user,
      (await addEntry(app, user, list.id, { text: 'Milk' })).id,
    );

    const res = await apiAs(app, user)('POST', `/history/${record.id}/readd`, { entryId: 'x' });

    expect(res.statusCode).toBe(400);
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
      `/history/${record.id}/readd`,
      {},
    );

    expect(res.statusCode).toBe(404);
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

    const res = await apiAs(app, user)('POST', `/history/${record.id}/readd`, {});

    expect(res.statusCode).toBe(409);
  });
});
