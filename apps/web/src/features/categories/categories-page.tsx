import type { CategoryDto } from '@shoppy/shared';
import { getRouteApi } from '@tanstack/react-router';
import { Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { EmptyState } from '@/components/ui/empty-state';
import { FormAlert } from '@/components/ui/form-alert';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { scopeFromId, scopeId } from '@/features/households/scope-key';
import { useHouseholds } from '@/features/households/use-households';
import { useScopePermissions } from '@/features/households/use-scope-permissions';
import { CategorySheet } from './category-sheet';
import { SortableCategoryList } from './sortable-category-list';
import { useCategories } from './use-categories';
import { useReorderCategories } from './use-reorder-categories';

const route = getRouteApi('/_authenticated/catalog/categories');

type SheetState = { isOpen: false } | { isOpen: true; category?: CategoryDto };

export function CategoriesPage() {
  const search = route.useSearch();
  const scope = scopeFromId(search.scope);
  const permissions = useScopePermissions(scope);
  const households = useHouseholds();
  const categories = useCategories(scope);
  const reorder = useReorderCategories(scope);
  const [sheet, setSheet] = useState<SheetState>({ isOpen: false });
  const canUpdate = permissions.has('category.update');
  const canDelete = permissions.has('category.delete');
  const householdName =
    scope.kind === 'household'
      ? households.data?.find(({ id }) => id === scope.householdId)?.name
      : undefined;

  return (
    <Page
      title="Categories"
      leading={
        <BackLink to="/catalog" search={{ scope: scopeId(scope) }} label="Back to catalog" />
      }
      actions={
        permissions.has('category.create') && (
          <IconButton icon={Plus} label="New category" onClick={() => setSheet({ isOpen: true })} />
        )
      }
    >
      <p className="-mt-3 text-sm text-muted-foreground">
        {householdName ? `${householdName}. ` : ''}Lists are grouped in this order.
        {canUpdate && ' Drag the handle to match your shop.'}
      </p>
      {reorder.error && <FormAlert tone="error">{reorder.error.message}</FormAlert>}
      <QueryState query={categories}>
        {(data) =>
          data.length === 0 ? (
            <EmptyState icon={Tags} title="No categories">
              Add one to group your items.
            </EmptyState>
          ) : (
            <SortableCategoryList
              categories={data}
              isReorderable={canUpdate}
              onReorder={(ordered) => reorder.mutate(ordered)}
              onOpen={
                canUpdate || canDelete
                  ? (category) => setSheet({ isOpen: true, category })
                  : undefined
              }
            />
          )
        }
      </QueryState>
      <CategorySheet
        isOpen={sheet.isOpen}
        scope={scope}
        category={sheet.isOpen ? sheet.category : undefined}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onClose={() => setSheet({ isOpen: false })}
      />
    </Page>
  );
}
