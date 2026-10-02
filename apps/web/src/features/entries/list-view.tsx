import type { EntryDto, ListDetailDto } from '@shoppy/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import { Ellipsis, Eye, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { RecentHistorySection } from '@/features/history/recent-history-section';
import { useRecentHistory } from '@/features/history/use-recent-history';
import { scopeOfList } from '@/features/households/scope-key';
import { useSaveList } from '@/features/lists/use-save-list';
import { cn } from '@/lib/cn';
import { ArchivedBanner } from './archived-banner';
import { EntryGroups } from './entry-groups';
import { EntrySheet } from './entry-sheet';
import { groupEntries } from './group-entries';
import { listAbilities } from './list-abilities';
import { ListDialogs, type ListDialog } from './list-dialogs';
import { ListEntryRow, type ListEntryRowMode } from './list-entry-row';
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
  const scope = scopeOfList(list.scope);
  const abilities = listAbilities(list);
  const categories = useCategories(scope);
  const items = useItems(scope);
  const recent = useRecentHistory(list.id, abilities.canViewHistory);
  const checkEntry = useCheckEntry(list.id);
  const bulk = useBulkEntries(list.id);
  const saveList = useSaveList(list);
  const selection = useSelection();
  const [openEntry, setOpenEntry] = useState<EntryDto>();
  const [dialog, setDialog] = useState<ListDialog>(null);

  const groups = groupEntries(list.entries, categories.data ?? []);
  const hasEntries = list.entries.length > 0;
  const isViewOnly = !list.isArchived && !abilities.canAdd && !abilities.canCheck;

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
    return {
      kind: 'plan',
      onCheck: abilities.canCheck ? () => checkEntry.mutate(entry) : undefined,
      onOpen: abilities.canEdit || abilities.canRemove ? () => setOpenEntry(entry) : undefined,
    };
  };

  return (
    <Page
      title={list.name}
      width="wide"
      className="pb-44"
      leading={<BackLink to="/lists" label="Back to lists" />}
      actions={
        <>
          {abilities.canCheck && hasEntries && (
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
      {list.scope.kind === 'household' && (
        <p className="-mt-4 text-sm text-muted-foreground">{list.scope.householdName}</p>
      )}
      <div
        className={cn(
          'flex flex-col gap-6',
          abilities.canViewHistory &&
            'lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8',
        )}
      >
        <div className="flex flex-col gap-6">
          {list.isArchived && (
            <ArchivedBanner
              isPending={saveList.isPending}
              onUnarchive={
                abilities.canUpdateList ? () => saveList.mutate({ isArchived: false }) : undefined
              }
            />
          )}
          {isViewOnly && (
            <p className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm">
              <Eye className="size-4 text-muted-foreground" aria-hidden />
              View only
            </p>
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
              {abilities.canAdd ? 'Add something below.' : 'This list is empty.'}
            </EmptyState>
          )}
        </div>
        {abilities.canViewHistory && (
          <aside className="lg:sticky lg:top-8">
            <RecentHistorySection listId={list.id} scope={scope} abilities={abilities} />
          </aside>
        )}
      </div>

      {selection.isSelecting ? (
        <SelectionBar
          count={selection.selectedIds.length}
          primaryLabel={abilities.canCheck ? 'Check' : undefined}
          onPrimary={() => bulkSelected('check')}
          onDelete={abilities.canRemove ? () => bulkSelected('delete') : undefined}
          onCancel={selection.stop}
        />
      ) : (
        abilities.canAdd && (
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
        abilities={abilities}
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
