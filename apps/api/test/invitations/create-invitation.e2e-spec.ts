import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';
import { createdInvitationSchema, inviteCodeSchema } from '@shoppy/shared';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/households/:id/invitations', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a link with a 7-day expiry and shows its URL once', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'LINK',
      role: 'MEMBER',
      maxUses: 3,
    });

    const created = parseOk(res, createdInvitationSchema);
    expect(created.url).toMatch(/\/join\/[\w-]{43}$/);
    expect(created.invitation).toMatchObject({
      kind: 'LINK',
      role: 'MEMBER',
      maxUses: 3,
      usedCount: 0,
    });
    const days = (Date.parse(created.invitation.expiresAt) - Date.now()) / 86_400_000;
    expect(Math.round(days)).toBe(7);
  });

  it('creates an 8-character code', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'CODE',
      role: 'VIEWER',
    });

    const { code } = parseOk(res, createdInvitationSchema);
    expect(inviteCodeSchema.safeParse(code).success).toBe(true);
  });

  it('emails an invitation with a join link', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner, 'Beach house');
    const email = `friend-${household.id}@example.com`;

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email,
    });

    expect(res.statusCode).toBe(201);
    expect(sentEmails(app).lastLinkTo(email).pathname).toMatch(/^\/join\//);
    expect(sentEmails(app).sent.at(-1)?.subject).toContain('Beach house');
  });

  it('returns 409 when inviting someone who is already a member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'EMAIL',
      role: 'MEMBER',
      email: member.email,
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 403 when an Admin invites an Admin (FR-R6)', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');

    const res = await apiAs(app, admin)('POST', `/households/${household.id}/invitations`, {
      kind: 'LINK',
      role: 'ADMIN',
    });

    expect(res.statusCode).toBe(403);
  });

  it('returns 403 to a Member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, member)('POST', `/households/${household.id}/invitations`, {
      kind: 'LINK',
      role: 'VIEWER',
    });

    expect(res.statusCode).toBe(403);
  });

  it('returns 400 for an Owner invitation', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
      kind: 'LINK',
      role: 'OWNER',
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 429 after ten email invitations within an hour', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const invite = (index: number) =>
      apiAs(app, owner)('POST', `/households/${household.id}/invitations`, {
        kind: 'EMAIL',
        role: 'VIEWER',
        email: `guest-${index}-${household.id}@example.com`,
      });
    for (let index = 0; index < 10; index += 1) await invite(index);

    const res = await invite(10);

    expect(res.statusCode).toBe(429);
  });
});
