import type { EntryDto } from '@shoppy/shared';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EntryRowProps {
  entry: EntryDto;
  control?: ReactNode;
  onOpen?: () => void;
}

export function EntryRow({ entry, control, onOpen }: EntryRowProps) {
  const label = (
    <>
      <span className={cn('font-medium', entry.isChecked && 'text-muted-foreground line-through')}>
        {entry.name}
      </span>
      {entry.note && <span className="text-sm text-muted-foreground">{entry.note}</span>}
    </>
  );

  return (
    <li className="flex items-center">
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
    </li>
  );
}
