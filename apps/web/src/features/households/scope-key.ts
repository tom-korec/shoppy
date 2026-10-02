import type { ScopeRef } from '@shoppy/shared';

// Which catalog, categories or lists a screen works with: the user's own or a household's.
export type ScopeKey = { kind: 'personal' } | { kind: 'household'; householdId: string };

export const PERSONAL_SCOPE: ScopeKey = { kind: 'personal' };

// 'personal' or the household id: for query keys and the `scope` search param.
export function scopeId(scope: ScopeKey): string {
  return scope.kind === 'personal' ? 'personal' : scope.householdId;
}

export function scopeFromId(id: string | undefined): ScopeKey {
  return !id || id === 'personal' ? PERSONAL_SCOPE : { kind: 'household', householdId: id };
}

export function scopeOfList(ref: ScopeRef): ScopeKey {
  return ref.kind === 'personal'
    ? PERSONAL_SCOPE
    : { kind: 'household', householdId: ref.householdId };
}

export function scopePath(scope: ScopeKey): string {
  return scope.kind === 'personal' ? '/scopes/personal' : `/scopes/households/${scope.householdId}`;
}
