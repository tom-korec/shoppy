import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { Sheet } from '@/components/ui/sheet';
import { ListCard } from './list-card';
import { ListForm } from './list-form';
import { useLists } from './use-lists';

export function ListsPage() {
  const lists = useLists();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Page title="Lists">
      <QueryState query={lists}>
        {(data) => {
          const active = data.filter((list) => !list.isArchived);
          const archived = data.filter((list) => list.isArchived);
          return (
            <>
              {active.length === 0 ? (
                <EmptyState icon={ListChecks} title="No lists yet">
                  Create one for your next shop.
                </EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {active.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </ul>
              )}
              <Button width="full" onClick={() => setIsCreating(true)}>
                <Plus className="size-4" aria-hidden />
                New list
              </Button>
              {archived.length > 0 && (
                <details className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Archived ({archived.length})
                    <ChevronDown
                      className="size-4 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <ul className="mt-2 flex flex-col gap-2 opacity-80">
                    {archived.map((list) => (
                      <ListCard key={list.id} list={list} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          );
        }}
      </QueryState>
      <Sheet isOpen={isCreating} onClose={() => setIsCreating(false)} title="New list">
        <ListForm
          onSaved={(list) => {
            setIsCreating(false);
            void navigate({ to: '/lists/$listId', params: { listId: list.id } });
          }}
        />
      </Sheet>
    </Page>
  );
}
