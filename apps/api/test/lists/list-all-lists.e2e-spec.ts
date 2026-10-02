import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, createList } from '../support/shopping-fixtures.js';

describe('GET /api/lists', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns personal lists and the lists of the user's households", async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner, 'Home');
    const member = await addMember(app, owner, household.id, 'MEMBER');
    await apiAs(app, owner)('POST', `/scopes/households/${household.id}/lists`, {
      name: 'Shared',
      icon: 'house',
    });
    await createList(app, member, { name: 'Mine', icon: 'store' });
    await createList(app, owner, { name: "Owner's own", icon: 'store' });

    const res = await apiAs(app, member)('GET', '/lists');

    expect(res.json()).toEqual([
      expect.objectContaining({ name: 'Mine', scope: { kind: 'personal' } }),
      expect.objectContaining({
        name: 'Shared',
        scope: { kind: 'household', householdId: household.id, householdName: 'Home' },
      }),
    ]);
  });
});
