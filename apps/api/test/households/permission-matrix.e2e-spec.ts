import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  categorySchema,
  entrySchema,
  itemSchema,
  listSchema,
  type Permission,
  PERMISSIONS,
  purchaseRecordSchema,
  type Role,
  ROLE_DEFAULTS,
  ROLES,
} from '@shoppy/shared';
import { type RegisteredUser, registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import {
  addMember,
  createHousehold,
  type HouseholdMemberUser,
} from '../support/household-fixtures.js';
import { apiAs, parseOk } from '../support/shopping-fixtures.js';

interface Fixture {
  householdId: string;
  listId: string;
  entryId: string;
  itemId: string;
  categoryId: string;
  recordId: string;
  target: HouseholdMemberUser;
}

type Api = ReturnType<typeof apiAs>;

// One real request per permission, against household resources the Owner set up.
const ACTIONS: Record<Permission, (api: Api, f: Fixture) => ReturnType<Api>> = {
  'household.rename': (api, f) => api('PATCH', `/households/${f.householdId}`, { name: 'Renamed' }),
  'household.delete': (api, f) => api('DELETE', `/households/${f.householdId}`),
  'household.transfer': (api, f) =>
    api('POST', `/households/${f.householdId}/transfer`, { memberId: f.target.memberId }),
  'member.invite': (api, f) =>
    api('POST', `/households/${f.householdId}/invitations`, { kind: 'LINK', role: 'VIEWER' }),
  'member.remove': (api, f) => api('DELETE', `/members/${f.target.memberId}`),
  'member.changeRole': (api, f) =>
    api('PATCH', `/members/${f.target.memberId}`, { role: 'MEMBER' }),
  'member.editPermissions': (api, f) =>
    api('PATCH', `/members/${f.target.memberId}`, {
      overrides: [{ permission: 'entry.add', isGranted: true }],
    }),
  'list.create': (api, f) =>
    api('POST', `/scopes/households/${f.householdId}/lists`, { name: 'New', icon: 'store' }),
  'list.update': (api, f) => api('PATCH', `/lists/${f.listId}`, { name: 'Renamed' }),
  'list.delete': (api, f) => api('DELETE', `/lists/${f.listId}`),
  'entry.add': (api, f) => api('POST', `/lists/${f.listId}/entries`, { text: 'Tea' }),
  'entry.edit': (api, f) => api('PATCH', `/entries/${f.entryId}`, { note: '2' }),
  'entry.remove': (api, f) => api('DELETE', `/entries/${f.entryId}`),
  'entry.check': (api, f) => api('POST', `/entries/${f.entryId}/check`),
  'item.create': (api, f) =>
    api('POST', `/scopes/households/${f.householdId}/items`, { name: 'Tea' }),
  'item.update': (api, f) => api('PATCH', `/items/${f.itemId}`, { name: 'Oat milk' }),
  'item.delete': (api, f) => api('DELETE', `/items/${f.itemId}`),
  'category.create': (api, f) =>
    api('POST', `/scopes/households/${f.householdId}/categories`, {
      name: 'Pets',
      icon: 'paw-print',
    }),
  'category.update': (api, f) => api('PATCH', `/categories/${f.categoryId}`, { name: 'Renamed' }),
  'category.delete': (api, f) => api('DELETE', `/categories/${f.categoryId}`),
  'history.view': (api, f) => api('GET', `/lists/${f.listId}/history`),
  'history.restore': (api, f) => api('POST', `/history/${f.recordId}/readd`, {}),
  'history.delete': (api, f) => api('DELETE', `/history/${f.recordId}`),
};

describe('household permission matrix (NFR-7)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function setUp(
    role: Role,
  ): Promise<{ owner: RegisteredUser; actor: RegisteredUser; fixture: Fixture }> {
    const owner = await registerUser(app);
    const api = apiAs(app, owner);
    const { id: householdId } = await createHousehold(app, owner);
    const list = parseOk(
      await api('POST', `/scopes/households/${householdId}/lists`, {
        name: 'Shared',
        icon: 'house',
      }),
      listSchema,
    );
    const item = parseOk(
      await api('POST', `/scopes/households/${householdId}/items`, { name: 'Milk' }),
      itemSchema,
    );
    const category = parseOk(
      await api('POST', `/scopes/households/${householdId}/categories`, {
        name: 'Extra',
        icon: 'tag',
      }),
      categorySchema,
    );
    const entry = parseOk(
      await api('POST', `/lists/${list.id}/entries`, { itemId: item.id }),
      entrySchema,
    );
    const bought = parseOk(
      await api('POST', `/lists/${list.id}/entries`, { text: 'Bread' }),
      entrySchema,
    );
    const record = parseOk(await api('POST', `/entries/${bought.id}/check`), purchaseRecordSchema);
    const target = await addMember(app, owner, householdId, 'VIEWER');
    const actor = role === 'OWNER' ? owner : await addMember(app, owner, householdId, role);

    return {
      owner,
      actor,
      fixture: {
        householdId,
        listId: list.id,
        entryId: entry.id,
        itemId: item.id,
        categoryId: category.id,
        recordId: record.id,
        target,
      },
    };
  }

  const cases = ROLES.flatMap((role) =>
    PERMISSIONS.map((permission) => ({
      role,
      permission,
      expected: ROLE_DEFAULTS[role].has(permission) ? 'allowed' : 'denied',
    })),
  );

  it.each(cases)('$role: $permission is $expected', async ({ role, permission, expected }) => {
    const { actor, fixture } = await setUp(role);

    const res = await ACTIONS[permission](apiAs(app, actor), fixture);

    if (expected === 'allowed') expect(res.statusCode, res.body).toBeLessThan(300);
    else expect(res.statusCode, res.body).toBe(403);
  });

  it('lets a Viewer add entries once granted entry.add (FR-R4)', async () => {
    const owner = await registerUser(app);
    const { id: householdId } = await createHousehold(app, owner);
    const list = parseOk(
      await apiAs(app, owner)('POST', `/scopes/households/${householdId}/lists`, {
        name: 'Shared',
        icon: 'house',
      }),
      listSchema,
    );
    const viewer = await addMember(app, owner, householdId, 'VIEWER');
    const before = await apiAs(app, viewer)('POST', `/lists/${list.id}/entries`, { text: 'Tea' });

    await apiAs(app, owner)('PATCH', `/members/${viewer.memberId}`, {
      overrides: [{ permission: 'entry.add', isGranted: true }],
    });
    const after = await apiAs(app, viewer)('POST', `/lists/${list.id}/entries`, { text: 'Tea' });

    expect(before.statusCode).toBe(403);
    expect(after.statusCode).toBe(201);
  });

  it('returns 404 to someone outside the household for every by-id resource', async () => {
    const { fixture } = await setUp('MEMBER');
    const outsider = apiAs(app, await registerUser(app));

    const results = await Promise.all([
      outsider('GET', `/lists/${fixture.listId}`),
      outsider('PATCH', `/items/${fixture.itemId}`, { name: 'Mine' }),
      outsider('DELETE', `/categories/${fixture.categoryId}`),
      outsider('DELETE', `/entries/${fixture.entryId}`),
      outsider('DELETE', `/history/${fixture.recordId}`),
      outsider('GET', `/scopes/households/${fixture.householdId}/items`),
    ]);

    expect(results.map(({ statusCode }) => statusCode)).toEqual([404, 404, 404, 404, 404, 404]);
  });
});
