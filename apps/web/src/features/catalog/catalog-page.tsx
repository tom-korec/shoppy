import type { ItemDto } from '@shoppy/shared';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { ListChecks, Package, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { SearchField } from '@/components/ui/search-field';
import { useCategories } from '@/features/categories/use-categories';
import { SelectionBar } from '@/features/entries/selection-bar';
import { useSelection } from '@/features/entries/use-selection';
import { type ScopeKey, scopeFromId, scopeId } from '@/features/households/scope-key';
import { ScopeSwitcher } from '@/features/households/scope-switcher';
import { useScopePermissions } from '@/features/households/use-scope-permissions';
import { CatalogItemList } from './catalog-item-list';
import { CategoryFilter } from './category-filter';
import { CopyItemsSheet } from './copy-items-sheet';
import type { CategoryFilterValue } from './filter-items';
import { ItemSheet } from './item-sheet';
import { useCopyItems } from './use-copy-items';
import { useItems } from './use-items';

const route = getRouteApi('/_authenticated/catalog/');

type SheetState = { isOpen: false } | { isOpen: true; item?: ItemDto };

export function CatalogPage() {
  const search = route.useSearch();
  const navigate = useNavigate();
  const scope = scopeFromId(search.scope);
  const permissions = useScopePermissions(scope);
  const items = useItems(scope);
  const categories = useCategories(scope);
  const copyItems = useCopyItems();
  const selection = useSelection();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilterValue>('all');
  const [sheet, setSheet] = useState<SheetState>({ isOpen: false });
  const [isCopying, setIsCopying] = useState(false);
  const canUpdate = permissions.has('item.update');
  const canDelete = permissions.has('item.delete');

  const switchScope = (next: ScopeKey) => {
    selection.stop();
    setCategory('all');
    void navigate({ to: '/catalog', search: { scope: scopeId(next) } });
  };

  return (
    <Page
      title="Catalog"
      width="wide"
      className={selection.isSelecting ? 'pb-36' : undefined}
      actions={
        <>
          <Link
            to="/catalog/categories"
            search={{ scope: scopeId(scope) }}
            aria-label="Categories"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <Tags className="size-5" aria-hidden />
          </Link>
          {!selection.isSelecting && (
            <IconButton icon={ListChecks} label="Select items" onClick={selection.start} />
          )}
          {permissions.has('item.create') && (
            <IconButton icon={Plus} label="New item" onClick={() => setSheet({ isOpen: true })} />
          )}
        </>
      }
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8">
        <div className="flex flex-col gap-3 lg:contents">
          <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1 lg:flex-row lg:items-center lg:*:flex-1">
            <ScopeSwitcher label="Catalog of" value={scope} onChange={switchScope} />
            <SearchField
              label="Search the catalog"
              placeholder="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {categories.data && (
            <div className="lg:sticky lg:top-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <CategoryFilter
                categories={categories.data}
                value={category}
                onChange={setCategory}
              />
            </div>
          )}
        </div>
        <div className="lg:col-start-2 lg:row-start-2">
          <QueryState query={items}>
            {(data) =>
              data.length === 0 ? (
                <EmptyState icon={Package} title="This catalog is empty">
                  {permissions.has('item.create')
                    ? "Add things you buy often, so they're one tap away on every list."
                    : 'Nothing here yet.'}
                </EmptyState>
              ) : (
                <CatalogItemList
                  items={data}
                  categories={categories.data ?? []}
                  query={query}
                  category={category}
                  selection={selection}
                  onOpen={
                    canUpdate || canDelete ? (item) => setSheet({ isOpen: true, item }) : undefined
                  }
                />
              )
            }
          </QueryState>
        </div>
      </div>
      {selection.isSelecting && (
        <SelectionBar
          count={selection.selectedIds.length}
          primaryLabel="Copy to…"
          onPrimary={() => setIsCopying(true)}
          onCancel={selection.stop}
        />
      )}
      <ItemSheet
        isOpen={sheet.isOpen}
        scope={scope}
        item={sheet.isOpen ? sheet.item : undefined}
        initialCategoryId={
          category === 'all' || category === 'uncategorized' ? undefined : category
        }
        canUpdate={canUpdate}
        canDelete={canDelete}
        onClose={() => setSheet({ isOpen: false })}
      />
      <CopyItemsSheet
        isOpen={isCopying}
        from={scope}
        onCopy={(target) => {
          copyItems.mutate({ target, itemIds: selection.selectedIds });
          setIsCopying(false);
          selection.stop();
        }}
        onClose={() => setIsCopying(false)}
      />
    </Page>
  );
}
