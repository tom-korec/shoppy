import { z } from 'zod';

// The approved permission catalog and role matrix (docs/02-requirements.md, D-09).
export const PERMISSIONS = [
  'household.rename',
  'household.delete',
  'household.transfer',
  'member.invite',
  'member.remove',
  'member.changeRole',
  'member.editPermissions',
  'list.create',
  'list.update',
  'list.delete',
  'entry.add',
  'entry.edit',
  'entry.remove',
  'entry.check',
  'item.create',
  'item.update',
  'item.delete',
  'category.create',
  'category.update',
  'category.delete',
  'history.view',
  'history.restore',
  'history.delete',
] as const;

export const permissionSchema = z.enum(PERMISSIONS);
export type Permission = z.infer<typeof permissionSchema>;

export const ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

const ALL = new Set<Permission>(PERMISSIONS);

const CONTENT: Permission[] = [
  'list.create',
  'list.update',
  'list.delete',
  'entry.add',
  'entry.edit',
  'entry.remove',
  'entry.check',
  'item.create',
  'item.update',
  'item.delete',
  'category.create',
  'category.update',
  'category.delete',
  'history.view',
  'history.restore',
  'history.delete',
];

const MEMBER_DEFAULTS: Permission[] = [
  'list.create',
  'list.update',
  'entry.add',
  'entry.edit',
  'entry.remove',
  'entry.check',
  'item.create',
  'item.update',
  'history.view',
  'history.restore',
];

// Defaults: what a role has without overrides. Ceiling: the most it can ever be granted.
export const ROLE_DEFAULTS: Record<Role, ReadonlySet<Permission>> = {
  OWNER: ALL,
  ADMIN: new Set(
    PERMISSIONS.filter((p) => !['household.delete', 'household.transfer'].includes(p)),
  ),
  MEMBER: new Set(MEMBER_DEFAULTS),
  VIEWER: new Set<Permission>(['history.view']),
};

export const ROLE_CEILINGS: Record<Role, ReadonlySet<Permission>> = {
  OWNER: ALL,
  ADMIN: ROLE_DEFAULTS.ADMIN,
  MEMBER: new Set(CONTENT),
  VIEWER: new Set(CONTENT.filter((p) => p !== 'history.delete')),
};

export interface PermissionOverride {
  permission: Permission;
  isGranted: boolean;
}

// FR-R5: ceiling ∩ ((defaults ∪ grants) − revokes). The Owner always has everything.
export function effectivePermissions(
  role: Role,
  overrides: readonly PermissionOverride[],
): Set<Permission> {
  if (role === 'OWNER') return new Set(ALL);
  const result = new Set(ROLE_DEFAULTS[role]);
  for (const { permission, isGranted } of overrides) {
    if (isGranted) result.add(permission);
    else result.delete(permission);
  }
  const ceiling = ROLE_CEILINGS[role];
  return new Set([...result].filter((permission) => ceiling.has(permission)));
}

// Only the Owner manages Admins; Admins manage Members and Viewers (FR-R6).
export function canManageRole(actor: Role, target: Role): boolean {
  if (target === 'OWNER') return false;
  if (actor === 'OWNER') return true;
  return actor === 'ADMIN' && (target === 'MEMBER' || target === 'VIEWER');
}
