import {
  canManageRole,
  effectivePermissions,
  PERMISSIONS,
  type Permission,
  type Role,
  ROLE_CEILINGS,
  ROLE_DEFAULTS,
  ROLES,
} from './permissions.js';

// The approved matrix: ✅ default on, ⚪ grantable, ⛔ never.
const MATRIX: Record<Permission, Record<Role, '✅' | '⚪' | '⛔'>> = {
  'household.rename': { OWNER: '✅', ADMIN: '✅', MEMBER: '⛔', VIEWER: '⛔' },
  'household.delete': { OWNER: '✅', ADMIN: '⛔', MEMBER: '⛔', VIEWER: '⛔' },
  'household.transfer': { OWNER: '✅', ADMIN: '⛔', MEMBER: '⛔', VIEWER: '⛔' },
  'member.invite': { OWNER: '✅', ADMIN: '✅', MEMBER: '⛔', VIEWER: '⛔' },
  'member.remove': { OWNER: '✅', ADMIN: '✅', MEMBER: '⛔', VIEWER: '⛔' },
  'member.changeRole': { OWNER: '✅', ADMIN: '✅', MEMBER: '⛔', VIEWER: '⛔' },
  'member.editPermissions': { OWNER: '✅', ADMIN: '✅', MEMBER: '⛔', VIEWER: '⛔' },
  'list.create': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'list.update': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'list.delete': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⚪' },
  'entry.add': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'entry.edit': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'entry.remove': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'entry.check': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'item.create': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'item.update': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'item.delete': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⚪' },
  'category.create': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⚪' },
  'category.update': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⚪' },
  'category.delete': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⚪' },
  'history.view': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '✅' },
  'history.restore': { OWNER: '✅', ADMIN: '✅', MEMBER: '✅', VIEWER: '⚪' },
  'history.delete': { OWNER: '✅', ADMIN: '✅', MEMBER: '⚪', VIEWER: '⛔' },
};

describe('role matrix', () => {
  const cases = ROLES.flatMap((role) => PERMISSIONS.map((permission) => ({ role, permission })));

  it.each(cases)('$role: $permission matches the approved matrix', ({ role, permission }) => {
    const cell = MATRIX[permission][role];

    expect(ROLE_DEFAULTS[role].has(permission)).toBe(cell === '✅');
    expect(ROLE_CEILINGS[role].has(permission)).toBe(cell !== '⛔');
  });

  it.each(cases)(
    '$role: granting $permission never exceeds the ceiling',
    ({ role, permission }) => {
      const granted = effectivePermissions(role, [{ permission, isGranted: true }]);

      expect(granted.has(permission)).toBe(MATRIX[permission][role] !== '⛔');
    },
  );

  it.each(cases)(
    '$role: revoking $permission removes it, except for the Owner',
    ({ role, permission }) => {
      const revoked = effectivePermissions(role, [{ permission, isGranted: false }]);

      expect(revoked.has(permission)).toBe(role === 'OWNER');
    },
  );
});

describe('canManageRole', () => {
  it('lets the Owner manage everyone but the Owner', () => {
    expect(
      ['ADMIN', 'MEMBER', 'VIEWER', 'OWNER'].map((r) => canManageRole('OWNER', r as Role)),
    ).toEqual([true, true, true, false]);
  });

  it('lets an Admin manage only Members and Viewers', () => {
    expect(
      ['ADMIN', 'MEMBER', 'VIEWER', 'OWNER'].map((r) => canManageRole('ADMIN', r as Role)),
    ).toEqual([false, true, true, false]);
  });

  it('lets Members and Viewers manage nobody', () => {
    expect(canManageRole('MEMBER', 'VIEWER')).toBe(false);
    expect(canManageRole('VIEWER', 'VIEWER')).toBe(false);
  });
});
