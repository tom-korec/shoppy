import type { EntryDto, ListDetailDto } from '@shoppy/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import { Ellipsis, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { RecentHistorySection } from '@/features/history/recent-history-section';
import { useRecentHistory } from '@/features/history/use-recent-history';
import { useSaveList } from '@/features/lists/use-save-list';
import { ArchivedBanner } from './archived-banner';
import { EntryGroups } from './entry-groups';
import { EntrySheet } from './entry-sheet';
import { groupEntries } from './group-entries';
import { ListEntryRow, type ListEntryRowMode } from './list-entry-row';
import { ListDialogs, type ListDialog } from './list-dialogs';
import type { ListMenuAction } from './list-menu-sheet';
import { QuickAddBar } from './quick-add-bar';
import { SelectionBar } from './selection-bar';
import { useBulkEntries } from './use-bulk-entries';
import { useCheckEntry } from './use-check-entry';
import { useSelection } from './use-selection';

interface ListViewProps {
  list: ListDetailDto;
}

export function ListView({ list }: ListViewProps) {
  const navigate = useNavigate();
  const categories = useCategories();
  const items = useItems();
  const recent = useRecentHistory(list.id);
  const checkEntry = useCheckEntry(list.id);
  const bulk = useBulkEntries(list.id);
  const saveList = useSaveList(list);
  const selection = useSelection();
  const [openEntry, setOpenEntry] = useState<EntryDto>();
  const [dialog, setDialog] = useState<ListDialog>(null);

  const groups = groupEntries(list.entries, categories.data ?? []);
  const hasEntries = list.entries.length > 0;

  const handleMenuAction = (action: ListMenuAction) => {
    setDialog(null);
    if (action === 'select') return selection.start();
    if (action === 'history') {
      return void navigate({ to: '/lists/$listId/history', params: { listId: list.id } });
    }
    if (action === 'archive' || action === 'unarchive') {
      return saveList.mutate({ isArchived: action === 'archive' });
    }
    setDialog(action);
  };

  const bulkSelected = (action: 'check' | 'delete') => {
    bulk.mutate({ action, ids: selection.selectedIds });
    selection.stop();
  };

  const rowMode = (entry: EntryDto): ListEntryRowMode => {
    if (selection.isSelecting) {
      return {
        kind: 'select',
        isSelected: selection.isSelected(entry.id),
        onToggle: () => selection.toggle(entry.id),
      };
    }
    if (list.isArchived) return { kind: 'read-only' };
    return {
      kind: 'plan',
      onCheck: () => checkEntry.mutate(entry),
      onOpen: () => setOpenEntry(entry),
    };
  };

  return (
    <Page
      title={list.name}
      className="pb-44"
      leading={<BackLink to="/lists" label="Back to lists" />}
      actions={
        <>
          {!list.isArchived && hasEntries && (
            <Link
              to="/lists/$listId/shop"
              params={{ listId: list.id }}
              className="flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <ShoppingCart className="size-4" aria-hidden />
              Shop
            </Link>
          )}
          <IconButton icon={Ellipsis} label="List options" onClick={() => setDialog('menu')} />
        </>
      }
    >
      {list.isArchived && (
        <ArchivedBanner
          isPending={saveList.isPending}
          onUnarchive={() => saveList.mutate({ isArchived: false })}
        />
      )}
      {hasEntries ? (
        <EntryGroups
          groups={groups}
          renderEntry={(entry) => (
            <ListEntryRow key={entry.id} entry={entry} mode={rowMode(entry)} />
          )}
        />
      ) : (
        <EmptyState icon={ShoppingBasket} title="Nothing to buy">
          {list.isArchived ? 'This list is empty.' : 'Add something below.'}
        </EmptyState>
      )}
      <RecentHistorySection listId={list.id} isReadOnly={list.isArchived} />

      {selection.isSelecting ? (
        <SelectionBar
          count={selection.selectedIds.length}
          primaryLabel="Check"
          onPrimary={() => bulkSelected('check')}
          onDelete={() => bulkSelected('delete')}
          onCancel={selection.stop}
        />
      ) : (
        !list.isArchived && (
          <QuickAddBar
            listId={list.id}
            items={items.data ?? []}
            categories={categories.data ?? []}
            recentRecords={recent.data?.records ?? []}
          />
        )
      )}

      <EntrySheet
        listId={list.id}
        entry={openEntry}
        categories={categories.data ?? []}
        onClose={() => setOpenEntry(undefined)}
      />
      <ListDialogs
        list={list}
        dialog={dialog}
        onMenuAction={handleMenuAction}
        onClose={() => setDialog(null)}
      />
    </Page>
  );
}
