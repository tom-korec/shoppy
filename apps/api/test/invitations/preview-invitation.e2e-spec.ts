import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { createHousehold, inviteLink } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('POST /api/invitations/preview', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('describes the invitation without joining', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner, 'Flat');
    const token = await inviteLink(app, owner, household.id, 'VIEWER');
    const guest = await registerUser(app);

    const res = await apiAs(app, guest)('POST', '/invitations/preview', { token });

    expect(res.json()).toMatchObject({
      householdId: household.id,
      householdName: 'Flat',
      role: 'VIEWER',
      invitedBy: 'Anna',
      isAlreadyMember: false,
    });
    expect((await apiAs(app, guest)('GET', `/households/${household.id}`)).statusCode).toBe(404);
  });

  it('returns 404 for an unknown token', async () => {
    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/preview', {
      token: 'not-a-real-token',
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for a malformed code', async () => {
    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/preview', {
      code: 'ILOU',
    });

    expect(res.statusCode).toBe(400);
  });
});
