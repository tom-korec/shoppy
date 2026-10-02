import type { EntryDto } from '@shoppy/shared';
import { CheckCircle } from '@/components/ui/check-circle';
import { EntryRow } from './entry-row';

// `plan` handlers are left out when the user may not check or edit entries.
export type ListEntryRowMode =
  | { kind: 'plan'; onCheck?: () => void; onOpen?: () => void }
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
  return (
    <EntryRow
      entry={entry}
      control={
        mode.onCheck ? (
          <CheckCircle label={`Bought ${entry.name}`} isChecked={false} onToggle={mode.onCheck} />
        ) : (
          <span className="w-3" />
        )
      }
      onOpen={mode.onOpen}
    />
  );
}
