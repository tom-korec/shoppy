import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  History,
  ListChecks,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { SheetAction } from '@/components/ui/sheet-action';
import type { ListAbilities } from './list-abilities';

export type ListMenuAction =
  | 'select'
  | 'check-all'
  | 'delete-all'
  | 'history'
  | 'edit'
  | 'archive'
  | 'unarchive'
  | 'delete-list';

interface ListMenuSheetProps {
  isOpen: boolean;
  isArchived: boolean;
  hasEntries: boolean;
  abilities: ListAbilities;
  onAction: (action: ListMenuAction) => void;
  onClose: () => void;
}

export function ListMenuSheet({
  isOpen,
  isArchived,
  hasEntries,
  abilities,
  onAction,
  onClose,
}: ListMenuSheetProps) {
  const { canCheck, canRemove } = abilities;
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="List">
      <div className="-mx-1 flex flex-col">
        {hasEntries && (canCheck || canRemove) && (
          <SheetAction
            icon={ListChecks}
            label="Select entries"
            onClick={() => onAction('select')}
          />
        )}
        {hasEntries && canCheck && (
          <SheetAction icon={CheckCheck} label="Check all" onClick={() => onAction('check-all')} />
        )}
        {hasEntries && canRemove && (
          <SheetAction
            icon={X}
            label="Delete all entries"
            isDanger
            onClick={() => onAction('delete-all')}
          />
        )}
        {abilities.canViewHistory && (
          <SheetAction icon={History} label="History" onClick={() => onAction('history')} />
        )}
        {abilities.canUpdateList && (
          <>
            <SheetAction
              icon={Pencil}
              label="Rename or change icon"
              onClick={() => onAction('edit')}
            />
            {isArchived ? (
              <SheetAction
                icon={ArchiveRestore}
                label="Unarchive"
                onClick={() => onAction('unarchive')}
              />
            ) : (
              <SheetAction icon={Archive} label="Archive" onClick={() => onAction('archive')} />
            )}
          </>
        )}
        {abilities.canDeleteList && (
          <SheetAction
            icon={Trash2}
            label="Delete list"
            isDanger
            onClick={() => onAction('delete-list')}
          />
        )}
      </div>
    </Sheet>
  );
}
