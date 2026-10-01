import { accessibleBy, personalScope, scopeOf, scopeWhere } from './scope.js';

const user = { id: 'user-1', sessionId: 'session-1', isEmailVerified: true };

describe('scope', () => {
  it('builds the personal scope of the current user', () => {
    expect(personalScope(user)).toEqual({ kind: 'personal', userId: 'user-1' });
  });

  it('filters rows by their owner', () => {
    expect(scopeWhere(personalScope(user))).toEqual({ ownerUserId: 'user-1' });
  });

  it('derives the scope of a row', () => {
    expect(scopeOf({ ownerUserId: 'user-2' })).toEqual({ kind: 'personal', userId: 'user-2' });
  });

  it('only reaches rows the user owns', () => {
    expect(accessibleBy(user)).toEqual({ ownerUserId: 'user-1' });
  });
});
