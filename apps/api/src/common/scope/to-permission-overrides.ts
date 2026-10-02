import { type PermissionOverride, permissionSchema } from '@shoppy/shared';

// Stored overrides are plain text; one for a permission that no longer exists is ignored.
export function toPermissionOverrides(
  rows: readonly { permission: string; isGranted: boolean }[],
): PermissionOverride[] {
  return rows.flatMap(({ permission, isGranted }) => {
    const parsed = permissionSchema.safeParse(permission);
    return parsed.success ? [{ permission: parsed.data, isGranted }] : [];
  });
}
