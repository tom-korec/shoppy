import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { dashboardSchema, listSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, archiveList, createList, parseOk } from '../support/shopping-fixtures.js';

describe('GET /api/me/dashboard', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const namesOf = (lists: { name: string }[]) => lists.map(({ name }) => name);

  it('returns favorites in order and the five most recently opened other lists', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const lists = [];
    for (const name of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      lists.push(await createList(app, user, { name, icon: 'store' }));
    }
    for (const list of lists) await api('POST', `/lists/${list.id}/visits`);
    await api('POST', '/me/favorites', { listId: lists[0]?.id });

    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);

    expect(namesOf(dashboard.favorites)).toEqual(['A']);
    expect(namesOf(dashboard.recent)).toEqual(['G', 'F', 'E', 'D', 'C']);
  });

  it('leaves out archived lists', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);
    await api('POST', `/lists/${list.id}/visits`);
    await api('POST', '/me/favorites', { listId: list.id });
    await archiveList(app, user, list.id);

    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);

    expect(dashboard).toEqual({ favorites: [], recent: [] });
  });

  it('shows household lists to members and drops them after leaving the household', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'VIEWER');
    const list = parseOk(
      await apiAs(app, owner)('POST', `/scopes/households/${household.id}/lists`, {
        name: 'Shared',
        icon: 'store',
      }),
      listSchema,
    );
    await apiAs(app, member)('POST', '/me/favorites', { listId: list.id });

    const before = parseOk(await apiAs(app, member)('GET', '/me/dashboard'), dashboardSchema);
    await apiAs(app, member)('POST', `/households/${household.id}/leave`);
    const after = parseOk(await apiAs(app, member)('GET', '/me/dashboard'), dashboardSchema);

    expect(namesOf(before.favorites)).toEqual(['Shared']);
    expect(after.favorites).toEqual([]);
  });

  it('requires a signed-in user', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/me/dashboard' });

    expect(res.statusCode).toBe(401);
  });
});
