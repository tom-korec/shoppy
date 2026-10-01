import type { PurchaseRecordDto } from '@shoppy/shared';
import { getRouteApi } from '@tanstack/react-router';
import { History, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from '@/components/ui/check-circle';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { SelectionBar } from '@/features/entries/selection-bar';
import { useListDetail } from '@/features/entries/use-list-detail';
import { useSelection } from '@/features/entries/use-selection';
import { entryFromRecord } from './entry-from-record';
import { HistoryRecordRow } from './history-record-row';
import { HistoryRecordSheet, type RecordAction } from './history-record-sheet';
import { useBulkHistory } from './use-bulk-history';
import { useDeleteRecord } from './use-delete-record';
import { useHistoryPages } from './use-history-pages';
import { useReaddRecord } from './use-readd-record';
import { useRestoreRecord } from './use-restore-record';

const route = getRouteApi('/_authenticated/lists/$listId/history');

export function HistoryPage() {
  const { listId } = route.useParams();
  const list = useListDetail(listId);
  const history = useHistoryPages(listId);
  const items = useItems();
  const categories = useCategories();
  const restore = useRestoreRecord(listId);
  const readd = useReaddRecord(listId);
  const deleteRecord = useDeleteRecord(listId);
  const bulk = useBulkHistory(listId);
  const selection = useSelection();
  const [openRecord, setOpenRecord] = useState<PurchaseRecordDto>();
  const isReadOnly = list.data?.isArchived ?? true;

  const act = (record: PurchaseRecordDto, action: RecordAction) => {
    setOpenRecord(undefined);
    if (action === 'delete') return deleteRecord.mutate(record.id);
    const variables = {
      record,
      optimistic: entryFromRecord(record, items.data ?? [], categories.data ?? []),
    };
    if (action === 'restore') restore.mutate(variables);
    else readd.mutate(variables);
  };

  const bulkSelected = (action: RecordAction) => {
    bulk.mutate({ action, ids: selection.selectedIds });
    selection.stop();
  };

  return (
    <Page
      title="History"
      className="pb-44"
      leading={<BackLink to="/lists/$listId" params={{ listId }} label="Back to the list" />}
      actions={
        !isReadOnly &&
        !selection.isSelecting && (
          <IconButton icon={ListChecks} label="Select records" onClick={selection.start} />
        )
      }
    >
      {list.data && <p className="-mt-4 text-muted-foreground">{list.data.name}</p>}
      <QueryState query={history}>
        {(data) => {
          const records = data.pages.flatMap((page) => page.records);
          if (records.length === 0) {
            return (
              <EmptyState icon={History} title="No history yet">
                Checked entries show up here.
              </EmptyState>
            );
          }
          return (
            <>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {records.map((record) =>
                  selection.isSelecting ? (
                    <HistoryRecordRow
                      key={record.id}
                      record={record}
                      control={
                        <CheckCircle
                          label={`Select ${record.name}`}
                          isChecked={selection.isSelected(record.id)}
                          onToggle={() => selection.toggle(record.id)}
                        />
                      }
                      onOpen={() => selection.toggle(record.id)}
                    />
                  ) : (
                    <HistoryRecordRow
                      key={record.id}
                      record={record}
                      onOpen={isReadOnly ? undefined : () => setOpenRecord(record)}
                    />
                  ),
                )}
              </ul>
              {history.hasNextPage && (
                <Button
                  variant="secondary"
                  isLoading={history.isFetchingNextPage}
                  onClick={() => void history.fetchNextPage()}
                >
                  Show more
                </Button>
              )}
            </>
          );
        }}
      </QueryState>
      {selection.isSelecting && (
        <SelectionBar
          count={selection.selectedIds.length}
          primaryLabel="Put back"
          onPrimary={() => bulkSelected('restore')}
          secondaryLabel="Add again"
          onSecondary={() => bulkSelected('readd')}
          onDelete={() => bulkSelected('delete')}
          onCancel={selection.stop}
        />
      )}
      <HistoryRecordSheet
        record={openRecord}
        onAction={act}
        onClose={() => setOpenRecord(undefined)}
      />
    </Page>
  );
}
