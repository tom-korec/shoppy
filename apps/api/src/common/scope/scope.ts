import type { AuthUser } from '../auth/auth-user.js';

// Who owns a category, item or list. Phase 3 adds the household variant.
export interface PersonalScope {
  kind: 'personal';
  userId: string;
}
export type Scope = PersonalScope;

export function personalScope(user: AuthUser): PersonalScope {
  return { kind: 'personal', userId: user.id };
}

export function scopeWhere(scope: Scope): { ownerUserId: string } {
  return { ownerUserId: scope.userId };
}

export function scopeOf(row: { ownerUserId: string }): Scope {
  return { kind: 'personal', userId: row.ownerUserId };
}

// Filter for loading a scoped row by id. A row the user can't reach is reported as missing (404),
// so ids of other people's data don't leak.
export function accessibleBy(user: AuthUser): { ownerUserId: string } {
  return { ownerUserId: user.id };
}
