import type { EntryDto } from '@shoppy/shared';
import type { ReactNode } from 'react';
import { type SwipeActions, SwipeRow } from '@/components/ui/swipe-row';
import { cn } from '@/lib/cn';

interface EntryRowProps {
  entry: EntryDto;
  control?: ReactNode;
  swipeActions?: SwipeActions;
  onOpen?: () => void;
}

export function EntryRow({ entry, control, swipeActions, onOpen }: EntryRowProps) {
  const label = (
    <>
      <span className={cn('font-medium', entry.isChecked && 'text-muted-foreground line-through')}>
        {entry.name}
      </span>
      {entry.note && <span className="text-sm text-muted-foreground">{entry.note}</span>}
    </>
  );

  const content = (
    <>
      {control}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-12 min-w-0 flex-1 flex-col items-start justify-center py-1 pr-2 text-left"
        >
          {label}
        </button>
      ) : (
        <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-center py-1 pr-2">
          {label}
        </div>
      )}
    </>
  );

  return (
    <li>
      {swipeActions ? (
        <SwipeRow actions={swipeActions}>{content}</SwipeRow>
      ) : (
        <div className="flex items-center">{content}</div>
      )}
    </li>
  );
}
