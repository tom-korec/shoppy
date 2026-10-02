import type { ListDetailDto, Permission } from '@shoppy/shared';

export interface ListAbilities {
  canAdd: boolean;
  canEdit: boolean;
  canRemove: boolean;
  canCheck: boolean;
  canPromote: boolean;
  canViewHistory: boolean;
  canRestore: boolean;
  canReadd: boolean;
  canDeleteHistory: boolean;
  canUpdateList: boolean;
  canDeleteList: boolean;
}

// What the screen offers (FR-R8): the user's permissions in the list's scope, and nothing that
// changes entries or history while the list is archived.
export function listAbilities(
  list: Pick<ListDetailDto, 'permissions' | 'isArchived'>,
): ListAbilities {
  const has = (permission: Permission) => list.permissions.includes(permission);
  const content = (permission: Permission) => !list.isArchived && has(permission);
  return {
    canAdd: content('entry.add'),
    canEdit: content('entry.edit'),
    canRemove: content('entry.remove'),
    canCheck: content('entry.check'),
    canPromote: content('entry.edit') && has('item.create'),
    canViewHistory: has('history.view'),
    canRestore: content('history.restore') && has('entry.add'),
    canReadd: content('history.restore'),
    canDeleteHistory: content('history.delete'),
    canUpdateList: has('list.update'),
    canDeleteList: has('list.delete'),
  };
}
