import {
  type Permission,
  type PermissionOverride,
  PERMISSIONS,
  type Role,
  ROLE_CEILINGS,
  ROLE_DEFAULTS,
} from '@shoppy/shared';

// The permissions an editor can tick for a role: its ceiling, in catalog order (FR-R4).
export function grantablePermissions(role: Role): Permission[] {
  return PERMISSIONS.filter((permission) => ROLE_CEILINGS[role].has(permission));
}

// The overrides that turn a role's defaults into the ticked set.
export function overridesFor(role: Role, ticked: ReadonlySet<Permission>): PermissionOverride[] {
  return grantablePermissions(role).flatMap((permission) => {
    const isDefault = ROLE_DEFAULTS[role].has(permission);
    const isTicked = ticked.has(permission);
    return isDefault === isTicked ? [] : [{ permission, isGranted: isTicked }];
  });
}
