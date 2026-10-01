import { getRouteApi, Navigate, useNavigate } from '@tanstack/react-router';
import { ShoppingBasket } from 'lucide-react';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { useRecentHistory } from '@/features/history/use-recent-history';
import { EntryGroups } from './entry-groups';
import { groupEntries } from './group-entries';
import { buildNewEntry } from './new-entry';
import { QuickAddForm } from './quick-add-form';
import { ShoppingEntryRow } from './shopping-entry-row';
import { useAddEntry } from './use-add-entry';
import { useFinishShopping } from './use-finish-shopping';
import { useListDetail } from './use-list-detail';
import { useUpdateEntry } from './use-update-entry';

const route = getRouteApi('/_authenticated/lists/$listId/shop');

// Shopping mode: tapping strikes an entry through (saved, so leaving keeps it); Finish moves the
// struck-through entries to history. An archived list is read-only, so it goes back to the list.
export function ShoppingPage() {
  const { listId } = route.useParams();
  const navigate = useNavigate();
  const list = useListDetail(listId);
  const categories = useCategories();
  const items = useItems();
  const recent = useRecentHistory(listId);
  const addEntry = useAddEntry(listId);
  const updateEntry = useUpdateEntry(listId);
  const finish = useFinishShopping(listId);

  if (list.data?.isArchived) return <Navigate to="/lists/$listId" params={{ listId }} />;

  const entries = list.data?.entries ?? [];
  const checkedCount = entries.filter((entry) => entry.isChecked).length;

  const finishShopping = () => {
    finish.mutate();
    void navigate({ to: '/lists/$listId', params: { listId } });
  };

  return (
    <Page
      title={list.data?.name ?? 'Shopping'}
      className="pb-32"
      leading={<BackLink to="/lists/$listId" params={{ listId }} label="Back to the list" />}
    >
      {list.isSuccess && (
        <QuickAddForm
          items={items.data ?? []}
          categories={categories.data ?? []}
          recentRecords={recent.data?.records ?? []}
          placement="below"
          onAdd={(draft) => addEntry.mutate(buildNewEntry(listId, draft))}
        />
      )}
      <QueryState query={list}>
        {() =>
          entries.length === 0 ? (
            <EmptyState icon={ShoppingBasket} title="All done">
              Nothing left on this list.
            </EmptyState>
          ) : (
            <EntryGroups
              groups={groupEntries(entries, categories.data ?? [])}
              renderEntry={(entry) => (
                <ShoppingEntryRow
                  key={entry.id}
                  entry={entry}
                  onToggle={() =>
                    updateEntry.mutate({
                      entryId: entry.id,
                      input: { isChecked: !entry.isChecked },
                    })
                  }
                />
              )}
            />
          )
        }
      </QueryState>
      {list.isSuccess && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <Button width="full" disabled={checkedCount === 0} onClick={finishShopping}>
              Finish · move {checkedCount} to history
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}
