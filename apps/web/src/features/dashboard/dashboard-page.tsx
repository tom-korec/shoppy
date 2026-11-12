import { Link } from '@tanstack/react-router';
import { ArrowDownUp, Clock, Star } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { ColumnFlow } from '@/components/ui/column-flow';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { Section } from '@/components/ui/section';
import { PendingInvitations } from '@/features/households/pending-invitations';
import { InstallCard } from '@/features/install/install-card';
import { ListCardList } from './list-card-list';
import { useDashboard } from './use-dashboard';
import { useReorderFavorites } from './use-reorder-favorites';

// Drag and drop is only needed once the user arranges favorites; Home stays light without it.
const ArrangeListsSheet = lazy(() =>
  import('@/features/lists/arrange-lists-sheet').then((module) => ({
    default: module.ArrangeListsSheet,
  })),
);

export function DashboardPage() {
  const dashboard = useDashboard();
  const reorderFavorites = useReorderFavorites();
  const [isArranging, setIsArranging] = useState(false);

  return (
    <Page
      title="Shoppy"
      width="wide"
      actions={
        <Link
          to="/lists"
          className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-primary hover:bg-muted"
        >
          All lists
        </Link>
      }
    >
      <InstallCard />
      <PendingInvitations />
      <QueryState query={dashboard}>
        {({ favorites, recent }) => (
          <ColumnFlow>
            <Section
              title="Favorites"
              action={
                favorites.length > 1 && (
                  <IconButton
                    icon={ArrowDownUp}
                    label="Arrange favorites"
                    onClick={() => setIsArranging(true)}
                    className="-my-3"
                  />
                )
              }
            >
              {favorites.length > 0 ? (
                <ListCardList lists={favorites} label="Favorites" />
              ) : (
                <EmptyState icon={Star} title="No favorite lists yet">
                  Tap the star on a list to pin it here.
                </EmptyState>
              )}
              {isArranging && (
                <Suspense>
                  <ArrangeListsSheet
                    isOpen
                    title="Arrange favorites"
                    lists={favorites}
                    onReorder={(ids) => reorderFavorites.mutate(ids)}
                    onClose={() => setIsArranging(false)}
                  />
                </Suspense>
              )}
            </Section>
            <Section title="Recently used">
              {recent.length > 0 ? (
                <ListCardList lists={recent} label="Recently used" />
              ) : (
                <EmptyState icon={Clock} title="Nothing here yet">
                  Other lists you open will show up here.
                </EmptyState>
              )}
            </Section>
          </ColumnFlow>
        )}
      </QueryState>
    </Page>
  );
}
