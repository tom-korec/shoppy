import type { AuthUser } from '../auth/auth-user.js';

// Who owns a category, item or list: one user (personal) or a household.
export type Scope =
  { kind: 'personal'; userId: string } | { kind: 'household'; householdId: string };

export type ScopeWhere = { ownerUserId: string } | { householdId: string };

export interface ScopedRow {
  ownerUserId: string | null;
  householdId: string | null;
}

export function personalScope(user: AuthUser): Scope {
  return { kind: 'personal', userId: user.id };
}

export function householdScope(householdId: string): Scope {
  return { kind: 'household', householdId };
}

// Also the scope columns of a new row.
export function scopeWhere(scope: Scope): ScopeWhere {
  return scope.kind === 'personal'
    ? { ownerUserId: scope.userId }
    : { householdId: scope.householdId };
}

export function scopeOf(row: ScopedRow): Scope {
  if (row.householdId) return householdScope(row.householdId);
  if (row.ownerUserId) return { kind: 'personal', userId: row.ownerUserId };
  throw new Error('Row without a scope');
}

// Filter for loading a scoped row by id: the user's own rows and those of their households.
// A row the user can't reach is reported as missing (404), so ids of other people's data don't
// leak. What the user may do with a reachable row is checked by ScopeAccess.
export function accessibleBy(user: AuthUser) {
  return {
    OR: [{ ownerUserId: user.id }, { household: { members: { some: { userId: user.id } } } }],
  };
}
