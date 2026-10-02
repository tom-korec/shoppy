import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('DELETE /api/members/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets an Admin remove a Member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, admin)('DELETE', `/members/${member.memberId}`);

    expect(res.statusCode).toBe(204);
    expect((await apiAs(app, member)('GET', `/households/${household.id}`)).statusCode).toBe(404);
  });

  it('returns 403 when an Admin removes another Admin', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');
    const otherAdmin = await addMember(app, owner, household.id, 'ADMIN');

    const res = await apiAs(app, admin)('DELETE', `/members/${otherAdmin.memberId}`);

    expect(res.statusCode).toBe(403);
  });

  it('returns 403 when an Admin removes the Owner', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');
    const members = (await apiAs(app, owner)('GET', `/households/${household.id}/members`)).json<
      { id: string; role: string }[]
    >();

    const res = await apiAs(app, admin)(
      'DELETE',
      `/members/${members.find(({ role }) => role === 'OWNER')?.id}`,
    );

    expect(res.statusCode).toBe(403);
  });

  it('returns 400 when removing yourself', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');

    const res = await apiAs(app, admin)('DELETE', `/members/${admin.memberId}`);

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a member of another household', async () => {
    const owner = await registerUser(app);
    const stranger = await addMember(app, owner, (await createHousehold(app, owner)).id, 'MEMBER');

    const res = await apiAs(app, await registerUser(app))(
      'DELETE',
      `/members/${stranger.memberId}`,
    );

    expect(res.statusCode).toBe(404);
  });
});
