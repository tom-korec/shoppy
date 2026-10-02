import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/households/:id/members', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists the members with roles and effective permissions', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const viewer = await addMember(app, owner, household.id, 'VIEWER');

    const res = await apiAs(app, viewer)('GET', `/households/${household.id}/members`);

    expect(res.json()).toEqual([
      expect.objectContaining({ userId: owner.user.id, role: 'OWNER', displayName: 'Anna' }),
      expect.objectContaining({
        userId: viewer.user.id,
        role: 'VIEWER',
        permissions: ['history.view'],
      }),
    ]);
  });

  it('returns 404 to someone outside the household', async () => {
    const household = await createHousehold(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))(
      'GET',
      `/households/${household.id}/members`,
    );

    expect(res.statusCode).toBe(404);
  });
});
