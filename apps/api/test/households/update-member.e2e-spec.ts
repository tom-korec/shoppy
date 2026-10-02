import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('PATCH /api/members/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function household() {
    const owner = await registerUser(app);
    const { id } = await createHousehold(app, owner);
    return {
      householdId: id,
      owner,
      admin: await addMember(app, owner, id, 'ADMIN'),
      member: await addMember(app, owner, id, 'MEMBER'),
      viewer: await addMember(app, owner, id, 'VIEWER'),
    };
  }

  it('lets the Owner promote a Member to Admin', async () => {
    const { owner, member } = await household();

    const res = await apiAs(app, owner)('PATCH', `/members/${member.memberId}`, { role: 'ADMIN' });

    expect(res.json()).toMatchObject({ role: 'ADMIN' });
  });

  it('lets an Admin turn a Member into a Viewer', async () => {
    const { admin, member } = await household();

    const res = await apiAs(app, admin)('PATCH', `/members/${member.memberId}`, { role: 'VIEWER' });

    expect(res.json()).toMatchObject({ role: 'VIEWER' });
  });

  it('returns 403 when an Admin promotes someone to Admin (FR-R6)', async () => {
    const { admin, member } = await household();

    const res = await apiAs(app, admin)('PATCH', `/members/${member.memberId}`, { role: 'ADMIN' });

    expect(res.statusCode).toBe(403);
  });

  it('returns 403 when an Admin changes another Admin', async () => {
    const { householdId, owner, admin } = await household();
    const otherAdmin = await addMember(app, owner, householdId, 'ADMIN');

    const res = await apiAs(app, admin)('PATCH', `/members/${otherAdmin.memberId}`, {
      role: 'MEMBER',
    });

    expect(res.statusCode).toBe(403);
  });

  it('returns 403 when a Member changes anyone', async () => {
    const { member, viewer } = await household();

    const res = await apiAs(app, member)('PATCH', `/members/${viewer.memberId}`, {
      role: 'MEMBER',
    });

    expect(res.statusCode).toBe(403);
  });

  it('grants a Viewer a permission within the ceiling', async () => {
    const { admin, viewer } = await household();

    const res = await apiAs(app, admin)('PATCH', `/members/${viewer.memberId}`, {
      overrides: [{ permission: 'entry.add', isGranted: true }],
    });

    expect(res.json<{ permissions: string[] }>().permissions).toContain('entry.add');
  });

  it('returns 400 for a grant beyond the ceiling (FR-R4)', async () => {
    const { owner, viewer } = await household();

    const res = await apiAs(app, owner)('PATCH', `/members/${viewer.memberId}`, {
      overrides: [{ permission: 'history.delete', isGranted: true }],
    });

    expect(res.statusCode).toBe(400);
  });

  it('drops grants the new role cannot have when demoting', async () => {
    const { owner, member } = await household();
    const api = apiAs(app, owner);
    await api('PATCH', `/members/${member.memberId}`, {
      overrides: [{ permission: 'history.delete', isGranted: true }],
    });

    const res = await api('PATCH', `/members/${member.memberId}`, { role: 'VIEWER' });

    expect(res.json()).toMatchObject({
      role: 'VIEWER',
      overrides: [],
      permissions: ['history.view'],
    });
  });

  it('returns 400 for an Owner role', async () => {
    const { owner, member } = await household();

    const res = await apiAs(app, owner)('PATCH', `/members/${member.memberId}`, { role: 'OWNER' });

    expect(res.statusCode).toBe(400);
  });
});
