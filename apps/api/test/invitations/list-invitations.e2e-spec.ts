import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { createHousehold, inviteLink } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/households/:id/invitations', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists open invitations without their secrets', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    await inviteLink(app, owner, household.id, 'VIEWER');

    const res = await apiAs(app, owner)('GET', `/households/${household.id}/invitations`);

    expect(res.json()).toEqual([expect.objectContaining({ kind: 'LINK', role: 'VIEWER' })]);
    expect(res.body).not.toMatch(/token|code_?hash|url/i);
  });

  it('leaves out used-up invitations', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id, 'MEMBER', 1);
    await apiAs(app, await registerUser(app))('POST', '/invitations/accept', { token });

    const res = await apiAs(app, owner)('GET', `/households/${household.id}/invitations`);

    expect(res.json()).toEqual([]);
  });
});
