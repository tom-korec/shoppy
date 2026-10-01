import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ENTRIES_MAX_PER_LIST, historyPageSchema, listDetailSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { insertRows } from '../support/insert-rows.js';
import { addEntry, apiAs, checkEntry, createList, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/lists/:listId/history/bulk', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function listWithHistory(names: string[]) {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    const records = [];
    for (const text of names) {
      records.push(await checkEntry(app, user, (await addEntry(app, user, list.id, { text })).id));
    }
    const read = async () => ({
      entries: parseOk(await api('GET', `/lists/${list.id}`), listDetailSchema).entries.map(
        ({ name }) => name,
      ),
      history: parseOk(
        await api('GET', `/lists/${list.id}/history`),
        historyPageSchema,
      ).records.map(({ name }) => name),
    });
    return { api, list, ids: records.map(({ id }) => id), read };
  }

  it('restores the selected records', async () => {
    const { api, list, ids, read } = await listWithHistory(['Milk', 'Bread']);

    const res = await api('POST', `/lists/${list.id}/history/bulk`, {
      action: 'restore',
      ids: [ids[0]],
    });

    expect(res.json()).toEqual({ count: 1 });
    expect(await read()).toEqual({ entries: ['Milk'], history: ['Bread'] });
  });

  it('re-adds the selected records and keeps them', async () => {
    const { api, list, ids, read } = await listWithHistory(['Milk', 'Bread']);

    await api('POST', `/lists/${list.id}/history/bulk`, { action: 'readd', ids });

    const { entries, history } = await read();
    expect(entries.sort()).toEqual(['Bread', 'Milk']);
    expect(history).toHaveLength(2);
  });

  it('deletes the selected records', async () => {
    const { api, list, ids, read } = await listWithHistory(['Milk', 'Bread']);

    await api('POST', `/lists/${list.id}/history/bulk`, { action: 'delete', ids });

    expect(await read()).toEqual({ entries: [], history: [] });
  });

  it('changes nothing when one of the records is from another list', async () => {
    const { api, list, ids, read } = await listWithHistory(['Milk']);
    const other = await listWithHistory(['Bread']);

    const res = await api('POST', `/lists/${list.id}/history/bulk`, {
      action: 'delete',
      ids: [ids[0], other.ids[0]],
    });

    expect(res.statusCode).toBe(404);
    expect((await read()).history).toEqual(['Milk']);
  });

  it('returns 400 for an unknown action', async () => {
    const { api, list, ids } = await listWithHistory(['Milk']);

    const res = await api('POST', `/lists/${list.id}/history/bulk`, { action: 'archive', ids });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 on an archived list', async () => {
    const { api, list, ids } = await listWithHistory(['Milk']);
    await api('PATCH', `/lists/${list.id}`, { isArchived: true });

    const res = await api('POST', `/lists/${list.id}/history/bulk`, { action: 'readd', ids });

    expect(res.statusCode).toBe(409);
  });

  it('returns 409 when the records would not fit on the list', async () => {
    const { api, list, ids } = await listWithHistory(['Milk']);
    await insertRows(app, 'entries', {
      ownerUserId: '',
      listId: list.id,
      count: ENTRIES_MAX_PER_LIST,
    });

    const res = await api('POST', `/lists/${list.id}/history/bulk`, { action: 'readd', ids });

    expect(res.statusCode).toBe(409);
  });
});
