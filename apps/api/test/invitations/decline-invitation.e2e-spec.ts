import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { pendingInvitationListSchema } from '@shoppy/shared';
import { createHousehold } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/invitations/:id/decline', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('declines an email invitation so it disappears', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const invitee = await registerUser(app);
    const api = apiAs(app, invitee);
    await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: invitee.email,
    });
    const [pending] = parseOk(
      await api('GET', '/invitations/pending'),
      pendingInvitationListSchema,
    );

    const res = await api('POST', `/invitations/${pending?.invitationId}/decline`);

    expect(res.statusCode).toBe(204);
    expect((await api('GET', '/invitations/pending')).json()).toEqual([]);
  });

  it("returns 404 for someone else's invitation", async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const invitee = await registerUser(app);
    await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: invitee.email,
    });
    const [pending] = parseOk(
      await apiAs(app, invitee)('GET', '/invitations/pending'),
      pendingInvitationListSchema,
    );

    const res = await apiAs(app, await registerUser(app))(
      'POST',
      `/invitations/${pending?.invitationId}/decline`,
    );

    expect(res.statusCode).toBe(404);
  });
});
