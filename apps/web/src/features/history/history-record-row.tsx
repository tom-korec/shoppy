import type { PurchaseRecordDto } from '@shoppy/shared';
import type { ReactNode } from 'react';

interface HistoryRecordRowProps {
  record: PurchaseRecordDto;
  isShared: boolean;
  control?: ReactNode;
  onOpen?: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

// In a household, the record also says who bought it.
export function HistoryRecordRow({ record, isShared, control, onOpen }: HistoryRecordRowProps) {
  const details = [
    record.note,
    record.categoryName,
    isShared && record.boughtBy?.displayName,
    dateFormatter.format(new Date(record.boughtAt)),
  ]
    .filter(Boolean)
    .join(' · ');

  const label = (
    <>
      <span className="truncate font-medium">{record.name}</span>
      <span className="truncate text-sm text-muted-foreground">{details}</span>
    </>
  );

  return (
    <li className="flex items-center">
      {control ?? <span className="w-4" />}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-14 min-w-0 flex-1 flex-col items-start justify-center py-1 pr-3 text-left"
        >
          {label}
        </button>
      ) : (
        <div className="flex min-h-14 min-w-0 flex-1 flex-col justify-center py-1 pr-3">
          {label}
        </div>
      )}
    </li>
  );
}
