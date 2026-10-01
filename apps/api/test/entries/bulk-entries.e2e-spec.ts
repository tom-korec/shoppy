import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { historyPageSchema, listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addEntry, apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/lists/:listId/entries/bulk', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function listWithEntries(names: string[]) {
    const user = await registerUser(app);
    const list = await createList(app, user);
    const entries = [];
    for (const text of names) entries.push(await addEntry(app, user, list.id, { text }));
    const api = apiAs(app, user);
    const read = async () => ({
      entries: parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema).entries,
      history: parseOk(await api('GET', `/lists/${list.id}/history`), historyPageSchema).records,
    });
    return { api, list, entries, read };
  }

  it('checks the selected entries', async () => {
    const { api, list, entries, read } = await listWithEntries(['Milk', 'Bread', 'Eggs']);

    const res = await api('POST', `/lists/${list.id}/entries/bulk`, {
      action: 'check',
      ids: [entries[0]?.id, entries[2]?.id],
    });

    expect(res.json()).toEqual({ count: 2 });
    const { entries: remaining, history } = await read();
    expect(remaining.map(({ name }) => name)).toEqual(['Bread']);
    expect(history.map(({ name }) => name).sort()).toEqual(['Eggs', 'Milk']);
  });

  it('deletes all entries without history', async () => {
    const { api, list, read } = await listWithEntries(['Milk', 'Bread']);

    const res = await api('POST', `/lists/${list.id}/entries/bulk`, {
      action: 'delete',
      all: true,
    });

    expect(res.json()).toEqual({ count: 2 });
    expect(await read()).toEqual({ entries: [], history: [] });
  });

  it('changes nothing when one of the entries is on another list', async () => {
    const { api, list, entries, read } = await listWithEntries(['Milk']);
    const other = await listWithEntries(['Bread']);

    const res = await api('POST', `/lists/${list.id}/entries/bulk`, {
      action: 'check',
      ids: [entries[0]?.id, other.entries[0]?.id],
    });

    expect(res.statusCode).toBe(404);
    expect((await read()).entries).toHaveLength(1);
  });

  it('returns 400 with both ids and all', async () => {
    const { api, list, entries } = await listWithEntries(['Milk']);

    const res = await api('POST', `/lists/${list.id}/entries/bulk`, {
      action: 'delete',
      ids: [entries[0]?.id],
      all: true,
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's list", async () => {
    const { list } = await listWithEntries(['Milk']);

    const res = await apiAs(app, await registerUser(app))(
      'POST',
      `/lists/${list.id}/entries/bulk`,
      { action: 'delete', all: true },
    );

    expect(res.statusCode).toBe(404);
  });

  it('returns 409 on an archived list', async () => {
    const { api, list } = await listWithEntries(['Milk']);
    await api('PATCH', `/lists/${list.id}`, { isArchived: true });

    const res = await api('POST', `/lists/${list.id}/entries/bulk`, {
      action: 'delete',
      all: true,
    });

    expect(res.statusCode).toBe(409);
  });
});
