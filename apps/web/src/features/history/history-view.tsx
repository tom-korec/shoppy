import type { ListDetailDto, PurchaseRecordDto } from '@shoppy/shared';
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
import { listAbilities } from '@/features/entries/list-abilities';
import { SelectionBar } from '@/features/entries/selection-bar';
import { useSelection } from '@/features/entries/use-selection';
import { scopeOfList } from '@/features/households/scope-key';
import { entryFromRecord } from './entry-from-record';
import { HistoryRecordRow } from './history-record-row';
import { HistoryRecordSheet, type RecordAction } from './history-record-sheet';
import { useBulkHistory } from './use-bulk-history';
import { useDeleteRecord } from './use-delete-record';
import { useHistoryPages } from './use-history-pages';
import { useReaddRecord } from './use-readd-record';
import { useRestoreRecord } from './use-restore-record';

interface HistoryViewProps {
  list: ListDetailDto;
}

export function HistoryView({ list }: HistoryViewProps) {
  const scope = scopeOfList(list.scope);
  const abilities = listAbilities(list);
  const history = useHistoryPages(list.id);
  const items = useItems(scope);
  const categories = useCategories(scope);
  const restore = useRestoreRecord(list.id);
  const readd = useReaddRecord(list.id);
  const deleteRecord = useDeleteRecord(list.id);
  const bulk = useBulkHistory(list.id);
  const selection = useSelection();
  const [openRecord, setOpenRecord] = useState<PurchaseRecordDto>();
  const canAct = abilities.canRestore || abilities.canReadd || abilities.canDeleteHistory;

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
      leading={
        <BackLink to="/lists/$listId" params={{ listId: list.id }} label="Back to the list" />
      }
      actions={
        canAct &&
        !selection.isSelecting && (
          <IconButton icon={ListChecks} label="Select records" onClick={selection.start} />
        )
      }
    >
      <p className="-mt-4 text-muted-foreground">{list.name}</p>
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
                      isShared={scope.kind === 'household'}
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
                      isShared={scope.kind === 'household'}
                      onOpen={canAct ? () => setOpenRecord(record) : undefined}
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
          primaryLabel={abilities.canRestore ? 'Put back' : undefined}
          onPrimary={() => bulkSelected('restore')}
          secondaryLabel={abilities.canReadd ? 'Add again' : undefined}
          onSecondary={() => bulkSelected('readd')}
          onDelete={abilities.canDeleteHistory ? () => bulkSelected('delete') : undefined}
          onCancel={selection.stop}
        />
      )}
      <HistoryRecordSheet
        record={openRecord}
        abilities={abilities}
        onAction={act}
        onClose={() => setOpenRecord(undefined)}
      />
    </Page>
  );
}
