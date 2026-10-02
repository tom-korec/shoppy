import { PERMISSIONS, ROLE_DEFAULTS } from '@shoppy/shared';
import { listAbilities } from './list-abilities';

describe('listAbilities', () => {
  it('offers everything on a personal list', () => {
    const abilities = listAbilities({ permissions: [...PERMISSIONS], isArchived: false });

    expect(Object.values(abilities).every(Boolean)).toBe(true);
  });

  it('offers a Viewer only the history', () => {
    const abilities = listAbilities({ permissions: [...ROLE_DEFAULTS.VIEWER], isArchived: false });

    expect(abilities).toMatchObject({ canViewHistory: true, canAdd: false, canCheck: false });
  });

  it('offers no entry or history changes on an archived list, but unarchiving', () => {
    const abilities = listAbilities({ permissions: [...PERMISSIONS], isArchived: true });

    expect(abilities).toMatchObject({
      canAdd: false,
      canCheck: false,
      canRestore: false,
      canDeleteHistory: false,
      canUpdateList: true,
    });
  });

  it('only offers restore with entry.add, but re-add without it', () => {
    const abilities = listAbilities({
      permissions: ['history.view', 'history.restore'],
      isArchived: false,
    });

    expect(abilities).toMatchObject({ canRestore: false, canReadd: true });
  });
});
