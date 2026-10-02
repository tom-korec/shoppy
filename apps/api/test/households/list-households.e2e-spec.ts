import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/households', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the user's households with their role and permissions", async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const viewer = await addMember(app, owner, household.id, 'VIEWER');
    await createHousehold(app, await registerUser(app), 'Not mine');

    const res = await apiAs(app, viewer)('GET', '/households');

    expect(res.json()).toEqual([
      expect.objectContaining({
        id: household.id,
        memberCount: 2,
        myRole: 'VIEWER',
        myPermissions: ['history.view'],
      }),
    ]);
  });
});
