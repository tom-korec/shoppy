import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, ListChecks, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { Section } from '@/components/ui/section';
import { Sheet } from '@/components/ui/sheet';
import { PendingInvitations } from '@/features/households/pending-invitations';
import { sectionLists, sortLists } from './arrange-lists';
import { ArrangeListsSheet } from './arrange-lists-sheet';
import { ListCard } from './list-card';
import { ListViewSheet } from './list-view-sheet';
import { NewListForm } from './new-list-form';
import { useListView } from './use-list-view';
import { useLists } from './use-lists';

type Dialog = 'new' | 'view' | 'arrange' | null;

const DEFAULT_VIEW = { isGrouped: true, sort: 'ACTIVITY', customOrder: [] } as const;

export function ListsPage() {
  const lists = useLists();
  const view = useListView();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<Dialog>(null);
  const settings = view.data ?? { ...DEFAULT_VIEW, customOrder: [] };

  return (
    <Page
      title="Lists"
      width="wide"
      actions={
        <IconButton icon={SlidersHorizontal} label="View" onClick={() => setDialog('view')} />
      }
    >
      <PendingInvitations />
      <QueryState query={lists}>
        {(data) => {
          const sorted = sortLists(data, settings);
          const active = sorted.filter((list) => !list.isArchived);
          const archived = sorted.filter((list) => list.isArchived);
          return (
            <>
              {active.length === 0 ? (
                <EmptyState icon={ListChecks} title="No lists yet">
                  Create one for your next shop.
                </EmptyState>
              ) : (
                sectionLists(active, settings.isGrouped).map((section) => {
                  const cards = (
                    <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
                      {section.lists.map((list) => (
                        <ListCard key={list.id} list={list} showsScope={!settings.isGrouped} />
                      ))}
                    </ul>
                  );
                  return section.title ? (
                    <Section key={section.key} title={section.title}>
                      {cards}
                    </Section>
                  ) : (
                    <div key={section.key}>{cards}</div>
                  );
                })
              )}
              <Button
                width="full"
                className="lg:w-auto lg:self-start"
                onClick={() => setDialog('new')}
              >
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
                  <ul className="mt-2 flex flex-col gap-2 opacity-80 lg:grid lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
                    {archived.map((list) => (
                      <ListCard key={list.id} list={list} showsScope />
                    ))}
                  </ul>
                </details>
              )}
              <ArrangeListsSheet
                isOpen={dialog === 'arrange'}
                lists={active}
                onClose={() => setDialog(null)}
              />
            </>
          );
        }}
      </QueryState>
      <Sheet isOpen={dialog === 'new'} onClose={() => setDialog(null)} title="New list">
        <NewListForm
          onCreated={(list) => {
            setDialog(null);
            void navigate({ to: '/lists/$listId', params: { listId: list.id } });
          }}
        />
      </Sheet>
      <ListViewSheet
        isOpen={dialog === 'view'}
        view={settings}
        onArrange={() => setDialog('arrange')}
        onClose={() => setDialog(null)}
      />
    </Page>
  );
}
