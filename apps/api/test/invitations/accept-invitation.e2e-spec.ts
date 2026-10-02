import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';
import { createdInvitationSchema } from '@shoppy/shared';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import { createHousehold, inviteLink } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/invitations/accept', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('joins the household with the invited role', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner, 'Flat');
    const token = await inviteLink(app, owner, household.id, 'VIEWER');

    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', { token });

    expect(res.json()).toMatchObject({ id: household.id, name: 'Flat', myRole: 'VIEWER' });
  });

  it('joins with a code typed in lower case with a dash', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const { code } = parseOk(
      await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
        kind: 'CODE',
        role: 'MEMBER',
      }),
      createdInvitationSchema,
    );
    const typed = `${code?.slice(0, 4).toLowerCase()}-${code?.slice(4)}`;

    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', {
      code: typed,
    });

    expect(res.json()).toMatchObject({ myRole: 'MEMBER' });
  });

  it('accepts no more people than the maximum uses', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id, 'MEMBER', 1);
    await apiAs(app, await registerUser(app))('POST', '/invitations/accept', { token });

    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', { token });

    expect(res.statusCode).toBe(404);
  });

  it('lets two people race for the last use only once', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id, 'MEMBER', 1);
    const [first, second] = [await registerUser(app), await registerUser(app)];

    const results = await Promise.all([
      apiAs(app, first)('POST', '/invitations/accept', { token }),
      apiAs(app, second)('POST', '/invitations/accept', { token }),
    ]);

    expect(results.filter(({ statusCode }) => statusCode === 200)).toHaveLength(1);
  });

  it('returns the household again to someone already in it', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id, 'VIEWER');

    const res = await apiAs(app, owner)('POST', '/invitations/accept', { token });

    expect(res.json()).toMatchObject({ myRole: 'OWNER' });
  });

  it('returns 404 for an expired link', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const token = await inviteLink(app, owner, household.id);
    await app.get(PrismaService).invitation.updateMany({
      where: { householdId: household.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const res = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', { token });

    expect(res.statusCode).toBe(404);
  });

  it('only lets the invited address accept an email invitation', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const invitee = await registerUser(app);
    await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: invitee.email,
    });
    const token = sentEmails(app).lastLinkTo(invitee.email).pathname.split('/').at(-1);

    const stranger = await apiAs(app, await registerUser(app))('POST', '/invitations/accept', {
      token,
    });
    const addressee = await apiAs(app, invitee)('POST', '/invitations/accept', { token });

    expect(stranger.statusCode).toBe(404);
    expect(addressee.json()).toMatchObject({ myRole: 'MEMBER' });
  });

  it('returns 429 after too many attempts with codes', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await api('POST', '/invitations/accept', { code: 'AAAAAAAA' });
    }

    const res = await api('POST', '/invitations/accept', { code: 'AAAAAAAA' });

    expect(res.statusCode).toBe(429);
  });
});
