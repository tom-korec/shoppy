import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { invitationListSchema } from '@shoppy/shared';
import { createHousehold, inviteLink } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

describe('DELETE /api/invitations/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('revokes an invitation so it no longer works', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id);
    const [invitation] = parseOk(
      await apiAs(app, owner)('GET', `/households/${household.id}/invitations`),
      invitationListSchema,
    );

    const res = await apiAs(app, owner)('DELETE', `/invitations/${invitation?.id}`);

    expect(res.statusCode).toBe(204);
    const accept = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', {
      token,
    });
    expect(accept.statusCode).toBe(404);
  });

  it("returns 404 for another household's invitation", async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    await inviteLink(app, owner, household.id);
    const [invitation] = parseOk(
      await apiAs(app, owner)('GET', `/households/${household.id}/invitations`),
      invitationListSchema,
    );

    const res = await apiAs(app, await registerUser(app))(
      'DELETE',
      `/invitations/${invitation?.id}`,
    );

    expect(res.statusCode).toBe(404);
  });
});
