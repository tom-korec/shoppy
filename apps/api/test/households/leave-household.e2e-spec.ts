import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('POST /api/households/:id/leave', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets a member leave', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, member)('POST', `/households/${household.id}/leave`);

    expect(res.statusCode).toBe(204);
    expect((await apiAs(app, member)('GET', `/households/${household.id}`)).statusCode).toBe(404);
  });

  it('returns 409 to the Owner (FR-H5)', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/leave`);

    expect(res.statusCode).toBe(409);
  });
});
