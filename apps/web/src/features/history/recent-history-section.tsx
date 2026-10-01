import type { PurchaseRecordDto } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { ChevronDown, Plus, RotateCcw } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { entryFromRecord } from './entry-from-record';
import { useReaddRecord } from './use-readd-record';
import { useRecentHistory } from './use-recent-history';
import { useRestoreRecord } from './use-restore-record';

interface RecentHistorySectionProps {
  listId: string;
  isReadOnly: boolean;
}

// FR-L12: collapsed below the list; the window is 7 or 30 days depending on how busy the list is.
export function RecentHistorySection({ listId, isReadOnly }: RecentHistorySectionProps) {
  const recent = useRecentHistory(listId);
  const items = useItems();
  const categories = useCategories();
  const restore = useRestoreRecord(listId);
  const readd = useReaddRecord(listId);
  const records = recent.data?.records ?? [];

  const toEntry = (record: PurchaseRecordDto) => ({
    record,
    optimistic: entryFromRecord(record, items.data ?? [], categories.data ?? []),
  });

  return (
    <section className="flex flex-col gap-2">
      {records.length > 0 && (
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Recent history · {recent.data?.windowDays} days ({records.length})
            <ChevronDown
              className="size-4 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <ul className="mt-1 divide-y divide-border rounded-2xl border border-border bg-card">
            {records.map((record) => (
              <li key={record.id} className="flex items-center gap-1 pl-4">
                <div className="flex min-h-12 min-w-0 flex-1 flex-col justify-center py-1">
                  <span className="truncate">{record.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {[record.note, formatRelativeTime(record.boughtAt)].filter(Boolean).join(' · ')}
                  </span>
                </div>
                {!isReadOnly && (
                  <>
                    <IconButton
                      icon={RotateCcw}
                      label={`Put ${record.name} back on the list`}
                      onClick={() => restore.mutate(toEntry(record))}
                    />
                    <IconButton
                      icon={Plus}
                      label={`Add ${record.name} again`}
                      onClick={() => readd.mutate(toEntry(record))}
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      <Link
        to="/lists/$listId/history"
        params={{ listId }}
        className="self-start py-2 text-sm font-medium text-primary"
      >
        All history
      </Link>
    </section>
  );
}
