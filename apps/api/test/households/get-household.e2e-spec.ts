import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/households/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the household to a member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);

    const res = await apiAs(app, owner)('GET', `/households/${household.id}`);

    expect(res.json()).toMatchObject({ id: household.id, myRole: 'OWNER' });
  });

  it('returns 404 to someone outside the household', async () => {
    const household = await createHousehold(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('GET', `/households/${household.id}`);

    expect(res.statusCode).toBe(404);
  });
});
