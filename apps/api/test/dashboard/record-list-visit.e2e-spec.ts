import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { dashboardSchema } from '@shoppy/shared';
import { LIST_VISIT_RATE_LIMIT } from '../../src/features/dashboard/dashboard.service.js';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createList, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/lists/:id/visits', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('moves the list to the top of recently used lists', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const first = await createList(app, user, { name: 'First', icon: 'store' });
    const second = await createList(app, user, { name: 'Second', icon: 'store' });
    await api('POST', `/lists/${first.id}/visits`);
    await api('POST', `/lists/${second.id}/visits`);

    const res = await api('POST', `/lists/${first.id}/visits`);

    expect(res.statusCode).toBe(204);
    const dashboard = parseOk(await api('GET', '/me/dashboard'), dashboardSchema);
    expect(dashboard.recent.map(({ name }) => name)).toEqual(['First', 'Second']);
  });

  it('limits how often visits are recorded', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);
    for (let visit = 0; visit < LIST_VISIT_RATE_LIMIT.limit; visit++) {
      await apiAs(app, user)('POST', `/lists/${list.id}/visits`);
    }

    const res = await apiAs(app, user)('POST', `/lists/${list.id}/visits`);

    expect(res.statusCode).toBe(429);
  });

  it('rejects an invalid list id', async () => {
    const user = await registerUser(app);

    const res = await apiAs(app, user)('POST', '/lists/nope/visits');

    expect(res.statusCode).toBe(400);
  });

  it("answers 404 for another user's list", async () => {
    const user = await registerUser(app);
    const foreign = await createList(app, await registerUser(app));

    const res = await apiAs(app, user)('POST', `/lists/${foreign.id}/visits`);

    expect(res.statusCode).toBe(404);
  });
});
