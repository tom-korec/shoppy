import { grantablePermissions, overridesFor } from './member-overrides';

describe('member overrides', () => {
  it('offers only permissions within the role ceiling', () => {
    expect(grantablePermissions('VIEWER')).not.toContain('history.delete');
    expect(grantablePermissions('VIEWER')).toContain('entry.add');
    expect(grantablePermissions('MEMBER')).not.toContain('member.invite');
  });

  it('records grants and revokes relative to the defaults', () => {
    const ticked = new Set(['history.view', 'entry.add'] as const);

    expect(overridesFor('VIEWER', ticked)).toEqual([{ permission: 'entry.add', isGranted: true }]);
  });

  it('records a revoked default', () => {
    expect(overridesFor('VIEWER', new Set())).toEqual([
      { permission: 'history.view', isGranted: false },
    ]);
  });
});
