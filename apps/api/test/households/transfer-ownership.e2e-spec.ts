import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { memberListSchema } from '@shoppy/shared';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/households/:id/transfer', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('makes the member the Owner and the old Owner an Admin', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/transfer`, {
      memberId: member.memberId,
    });

    expect(res.json()).toMatchObject({ myRole: 'ADMIN' });
    const members = parseOk(
      await apiAs(app, member)('GET', `/households/${household.id}/members`),
      memberListSchema,
    );
    expect(members.map(({ userId, role }) => [userId, role])).toEqual([
      [owner.user.id, 'ADMIN'],
      [member.user.id, 'OWNER'],
    ]);
  });

  it('returns 403 to an Admin', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const admin = await addMember(app, owner, household.id, 'ADMIN');
    const member = await addMember(app, owner, household.id, 'MEMBER');

    const res = await apiAs(app, admin)('POST', `/households/${household.id}/transfer`, {
      memberId: member.memberId,
    });

    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for a member of another household', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const otherOwner = await registerUser(app);
    const stranger = await addMember(
      app,
      otherOwner,
      (await createHousehold(app, otherOwner)).id,
      'MEMBER',
    );

    const res = await apiAs(app, owner)('POST', `/households/${household.id}/transfer`, {
      memberId: stranger.memberId,
    });

    expect(res.statusCode).toBe(404);
  });

  it('lets only one of two transfers sent at the same time succeed', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const first = await addMember(app, owner, household.id, 'MEMBER');
    const second = await addMember(app, owner, household.id, 'MEMBER');
    const api = apiAs(app, owner);

    const results = await Promise.all(
      [first, second].map(({ memberId }) =>
        api('POST', `/households/${household.id}/transfer`, { memberId }),
      ),
    );

    expect(results.map(({ statusCode }) => statusCode).sort((a, b) => a - b)).toEqual([200, 403]);
  });
});
