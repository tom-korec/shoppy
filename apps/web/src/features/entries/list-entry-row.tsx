import type { EntryDto } from '@shoppy/shared';
import { Check, Trash2 } from 'lucide-react';
import { CheckCircle } from '@/components/ui/check-circle';
import type { SwipeActions } from '@/components/ui/swipe-row';
import { haptic } from '@/lib/haptic';
import { EntryRow } from './entry-row';

// `plan` handlers are left out when the user may not check, edit or remove entries.
export type ListEntryRowMode =
  | { kind: 'plan'; onCheck?: () => void; onOpen?: () => void; onDelete?: () => void }
  | { kind: 'select'; isSelected: boolean; onToggle: () => void };

interface ListEntryRowProps {
  entry: EntryDto;
  mode: ListEntryRowMode;
}

export function ListEntryRow({ entry, mode }: ListEntryRowProps) {
  if (mode.kind === 'select') {
    return (
      <EntryRow
        entry={entry}
        control={
          <CheckCircle
            label={`Select ${entry.name}`}
            isChecked={mode.isSelected}
            onToggle={mode.onToggle}
          />
        }
        onOpen={mode.onToggle}
      />
    );
  }
  const { onCheck, onDelete } = mode;
  const check =
    onCheck &&
    (() => {
      haptic();
      onCheck();
    });
  const swipeActions: SwipeActions | undefined =
    check || onDelete
      ? {
          right: check && { label: 'Bought', icon: Check, tone: 'primary', onCommit: onCheck },
          left: onDelete && { label: 'Delete', icon: Trash2, tone: 'danger', onCommit: onDelete },
        }
      : undefined;

  return (
    <EntryRow
      entry={entry}
      control={
        check ? (
          <CheckCircle label={`Bought ${entry.name}`} isChecked={false} onToggle={check} />
        ) : (
          <span className="w-3" />
        )
      }
      swipeActions={swipeActions}
      onOpen={mode.onOpen}
    />
  );
}
