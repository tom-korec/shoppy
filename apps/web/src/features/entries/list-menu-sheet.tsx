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
  onAction: (action: ListMenuAction) => void;
  onClose: () => void;
}

export function ListMenuSheet({
  isOpen,
  isArchived,
  hasEntries,
  onAction,
  onClose,
}: ListMenuSheetProps) {
  const canEditEntries = !isArchived && hasEntries;
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="List">
      <div className="-mx-1 flex flex-col">
        {canEditEntries && (
          <>
            <SheetAction
              icon={ListChecks}
              label="Select entries"
              onClick={() => onAction('select')}
            />
            <SheetAction
              icon={CheckCheck}
              label="Check all"
              onClick={() => onAction('check-all')}
            />
            <SheetAction
              icon={X}
              label="Delete all entries"
              isDanger
              onClick={() => onAction('delete-all')}
            />
          </>
        )}
        <SheetAction icon={History} label="History" onClick={() => onAction('history')} />
        <SheetAction icon={Pencil} label="Rename or change icon" onClick={() => onAction('edit')} />
        {isArchived ? (
          <SheetAction
            icon={ArchiveRestore}
            label="Unarchive"
            onClick={() => onAction('unarchive')}
          />
        ) : (
          <SheetAction icon={Archive} label="Archive" onClick={() => onAction('archive')} />
        )}
        <SheetAction
          icon={Trash2}
          label="Delete list"
          isDanger
          onClick={() => onAction('delete-list')}
        />
      </div>
    </Sheet>
  );
}
