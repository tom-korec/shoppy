import { PERSONAL_SCOPE, scopeFromId, scopeId, scopeOfList, scopePath } from './scope-key';

const HOME = '01999d6c-6c4a-7c39-9a3f-000000000050';

describe('scope keys', () => {
  it('round-trips through the scope id', () => {
    expect(scopeFromId(scopeId(PERSONAL_SCOPE))).toEqual(PERSONAL_SCOPE);
    expect(scopeFromId(HOME)).toEqual({ kind: 'household', householdId: HOME });
  });

  it('defaults to personal without an id', () => {
    expect(scopeFromId(undefined)).toEqual(PERSONAL_SCOPE);
  });

  it("builds the API path of a list's scope", () => {
    const scope = scopeOfList({ kind: 'household', householdId: HOME, householdName: 'Home' });

    expect(scopePath(scope)).toBe(`/scopes/households/${HOME}`);
    expect(scopePath(PERSONAL_SCOPE)).toBe('/scopes/personal');
  });
});
