import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('PATCH /api/households/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets an Admin rename the household', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');

    const res = await apiAs(app, admin)('PATCH', `/households/${household.id}`, { name: 'Flat' });

    expect(res.json()).toMatchObject({ name: 'Flat' });
  });

  it('returns 403 to a Member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, member)('PATCH', `/households/${household.id}`, { name: 'Mine' });

    expect(res.statusCode).toBe(403);
  });
});
