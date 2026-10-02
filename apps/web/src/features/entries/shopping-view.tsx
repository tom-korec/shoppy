import type { ListDetailDto } from '@shoppy/shared';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { ShoppingBasket } from 'lucide-react';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { DockedBar } from '@/components/ui/docked-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { useItems } from '@/features/catalog/use-items';
import { useCategories } from '@/features/categories/use-categories';
import { useRecentHistory } from '@/features/history/use-recent-history';
import { scopeOfList } from '@/features/households/scope-key';
import { EntryGroups } from './entry-groups';
import { groupEntries } from './group-entries';
import { listAbilities } from './list-abilities';
import { buildNewEntry } from './new-entry';
import { QuickAddForm } from './quick-add-form';
import { ShoppingEntryRow } from './shopping-entry-row';
import { useAddEntry } from './use-add-entry';
import { useFinishShopping } from './use-finish-shopping';
import { useUpdateEntry } from './use-update-entry';

interface ShoppingViewProps {
  list: ListDetailDto;
}

// Shopping mode: tapping strikes an entry through (saved, so leaving keeps it); Finish moves the
// struck-through entries to history. Without the right to check (archived list, Viewer) it goes
// back to the list.
export function ShoppingView({ list }: ShoppingViewProps) {
  const navigate = useNavigate();
  const scope = scopeOfList(list.scope);
  const abilities = listAbilities(list);
  const categories = useCategories(scope);
  const items = useItems(scope);
  const recent = useRecentHistory(list.id, abilities.canViewHistory);
  const addEntry = useAddEntry(list.id);
  const updateEntry = useUpdateEntry(list.id);
  const finish = useFinishShopping(list.id);

  if (!abilities.canCheck) return <Navigate to="/lists/$listId" params={{ listId: list.id }} />;

  const checkedCount = list.entries.filter((entry) => entry.isChecked).length;

  const finishShopping = () => {
    finish.mutate();
    void navigate({ to: '/lists/$listId', params: { listId: list.id } });
  };

  return (
    <Page
      title={list.name}
      className="pb-32"
      leading={
        <BackLink to="/lists/$listId" params={{ listId: list.id }} label="Back to the list" />
      }
    >
      {abilities.canAdd && (
        <QuickAddForm
          items={items.data ?? []}
          categories={categories.data ?? []}
          recentRecords={recent.data?.records ?? []}
          placement="below"
          onAdd={(draft) => addEntry.mutate(buildNewEntry(list.id, draft))}
        />
      )}
      {list.entries.length === 0 ? (
        <EmptyState icon={ShoppingBasket} title="All done">
          Nothing left on this list.
        </EmptyState>
      ) : (
        <EntryGroups
          groups={groupEntries(list.entries, categories.data ?? [])}
          renderEntry={(entry) => (
            <ShoppingEntryRow
              key={entry.id}
              entry={entry}
              onToggle={() =>
                updateEntry.mutate({ entryId: entry.id, input: { isChecked: !entry.isChecked } })
              }
            />
          )}
        />
      )}
      <DockedBar className="bg-background/95">
        <Button width="full" disabled={checkedCount === 0} onClick={finishShopping}>
          Finish · move {checkedCount} to history
        </Button>
      </DockedBar>
    </Page>
  );
}
