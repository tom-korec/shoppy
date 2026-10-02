import { type Permission, PERMISSIONS } from '@shoppy/shared';
import type { ScopeKey } from './scope-key';
import { useHouseholds } from './use-households';

const EVERYTHING: ReadonlySet<Permission> = new Set(PERMISSIONS);
const NOTHING: ReadonlySet<Permission> = new Set();

// What the user may do in a scope, for hiding actions (FR-R8). The API enforces it anyway.
export function useScopePermissions(scope: ScopeKey): ReadonlySet<Permission> {
  const households = useHouseholds();
  if (scope.kind === 'personal') return EVERYTHING;
  const household = households.data?.find(({ id }) => id === scope.householdId);
  return household ? new Set(household.myPermissions) : NOTHING;
}
