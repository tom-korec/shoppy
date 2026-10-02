import { accessibleBy, householdScope, personalScope, scopeOf, scopeWhere } from './scope.js';

const user = { id: 'user-1', sessionId: 'session-1', isEmailVerified: true };

describe('scope', () => {
  it('builds the personal scope of the current user', () => {
    expect(personalScope(user)).toEqual({ kind: 'personal', userId: 'user-1' });
  });

  it('filters rows by their owner or household', () => {
    expect(scopeWhere(personalScope(user))).toEqual({ ownerUserId: 'user-1' });
    expect(scopeWhere(householdScope('home'))).toEqual({ householdId: 'home' });
  });

  it('derives the scope of a row', () => {
    expect(scopeOf({ ownerUserId: 'user-2', householdId: null })).toEqual({
      kind: 'personal',
      userId: 'user-2',
    });
    expect(scopeOf({ ownerUserId: null, householdId: 'home' })).toEqual(householdScope('home'));
  });

  it("reaches the user's own rows and those of their households", () => {
    expect(accessibleBy(user)).toEqual({
      OR: [{ ownerUserId: 'user-1' }, { household: { members: { some: { userId: 'user-1' } } } }],
    });
  });
});
