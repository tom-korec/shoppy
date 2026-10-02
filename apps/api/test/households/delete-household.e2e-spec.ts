import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';
import { listSchema } from '@shoppy/shared';

describe('DELETE /api/households/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deletes the household with its lists', async () => {
    const owner = await registerUser(app);
    const api = apiAs(app, owner);
    const household = await createHousehold(app, owner);
    const list = parseOk(
      await api('POST', `/scopes/households/${household.id}/lists`, {
        name: 'Shared',
        icon: 'house',
      }),
      listSchema,
    );

    const res = await api('DELETE', `/households/${household.id}`);

    expect(res.statusCode).toBe(204);
    expect((await api('GET', `/lists/${list.id}`)).statusCode).toBe(404);
  });

  it('returns 403 to an Admin', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');

    const res = await apiAs(app, admin)('DELETE', `/households/${household.id}`);

    expect(res.statusCode).toBe(403);
  });
});
