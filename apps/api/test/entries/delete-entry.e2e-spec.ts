import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addEntry, apiAs, archiveList, createList, parseOk } from '../support/shopping-fixtures.js';

describe('DELETE /api/entries/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('removes the entry without a history record (FR-L11b)', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Milk' });

    const res = await api('DELETE', `/entries/${entry.id}`);

    expect(res.statusCode).toBe(204);
    expect(parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema).entries).toEqual([]);
    const history = parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema);
    expect(history.records).toEqual([]);
  });

  it("returns 404 for another user's entry", async () => {
    const owner = await registerUser(app);
    const entry = await addEntry(app, owner, (await createList(app, owner)).id, { text: 'Milk' });

    const res = await apiAs(app, await registerUser(app))('DELETE', `/entries/${entry.id}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 409 on an archived list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const entry = await addEntry(app, user, list.id, { text: 'Milk' });
    await archiveList(app, user, list.id);

    const res = await apiAs(app, user)('DELETE', `/entries/${entry.id}`);

    expect(res.statusCode).toBe(409);
  });
});
