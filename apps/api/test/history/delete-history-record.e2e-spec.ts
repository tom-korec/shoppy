import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema } from '@shoppy/shared';
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

describe('DELETE /api/history/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes the record', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const record = await checkEntry(
      app,
      user,
      (await addEntry(app, user, list.id, { text: 'Milk' })).id,
    );

    const res = await api('DELETE', `/history/${record.id}`);

    expect(res.statusCode).toBe(204);
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toEqual([]);
  });

  it("returns 404 for another user's record", async () => {
    const owner = await registerUser(app);
    const list = await createList(app, owner);
    const record = await checkEntry(
      app,
      owner,
      (await addEntry(app, owner, list.id, { text: 'Milk' })).id,
    );

    const res = await apiAs(app, await registerUser(app))('DELETE', `/history/${record.id}`);

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

    const res = await apiAs(app, user)('DELETE', `/history/${record.id}`);

    expect(res.statusCode).toBe(409);
  });
});
