import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('GET /api/invitations/pending', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists email invitations addressed to the user', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner, 'Cottage');
    const invitee = await registerUser(app);
    await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: invitee.email.toUpperCase(),
    });

    const res = await apiAs(app, invitee)('GET', '/invitations/pending');

    expect(res.json()).toEqual([
      expect.objectContaining({ householdName: 'Cottage', role: 'MEMBER', invitedBy: 'Anna' }),
    ]);
  });

  it('leaves out households the user already belongs to', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'VIEWER');
    await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: `other-${household.id}@example.com`,
    });

    const res = await apiAs(app, member)('GET', '/invitations/pending');

    expect(res.json()).toEqual([]);
  });
});
