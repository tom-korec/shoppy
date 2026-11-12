import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { dashboardSchema, listSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

// Favorites and visits are the user's own, so any member who can see a list may use them.
describe('favorites and visits on household lists', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function sharedList(name: string) {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const viewer = await addMember(app, owner, household.id, 'VIEWER');
    const list = parseOk(
      await apiAs(app, owner)('POST', `/scopes/households/${household.id}/lists`, {
        name,
        icon: 'store',
      }),
      listSchema,
    );
    return { household, viewer, list };
  }

  it('lets a Viewer star and open a shared list', async () => {
    const { viewer, list } = await sharedList('Shared');
    const api = apiAs(app, viewer);

    const star = await api('POST', '/me/favorites', { listId: list.id });
    const visit = await api('POST', `/lists/${list.id}/visits`);

    expect([star.statusCode, visit.statusCode]).toEqual([204, 204]);
  });

  it('keeps favorites of a household the user left after the ones they reorder', async () => {
    const { household, viewer, list: shared } = await sharedList('Shared');
    const api = apiAs(app, viewer);
    const own = await createList(app, viewer, { name: 'Own', icon: 'store' });
    const other = await createList(app, viewer, { name: 'Other', icon: 'store' });
    for (const list of [shared, own, other])
      await api('POST', '/me/favorites', { listId: list.id });
    await api('POST', `/households/${household.id}/leave`);

    const res = await api('PUT', '/me/favorites/order', { ids: [other.id, shared.id, own.id] });
    const visit = await api('POST', `/lists/${shared.id}/visits`);

    expect(res.statusCode).toBe(204);
    expect(visit.statusCode).toBe(404);
    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);
    expect(dashboard.favorites.map(({ name }) => name)).toEqual(['Other', 'Own']);
  });
});
