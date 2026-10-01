import type { ItemDto } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { Package, Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { SearchField } from '@/components/ui/search-field';
import { useCategories } from '@/features/categories/use-categories';
import { CategoryFilter } from './category-filter';
import { type CategoryFilterValue, filterItems } from './filter-items';
import { ItemRow } from './item-row';
import { ItemSheet } from './item-sheet';
import { useItems } from './use-items';

type SheetState = { isOpen: false } | { isOpen: true; item?: ItemDto };

export function CatalogPage() {
  const items = useItems();
  const categories = useCategories();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilterValue>('all');
  const [sheet, setSheet] = useState<SheetState>({ isOpen: false });
  const categoryById = new Map(categories.data?.map((c) => [c.id, c]));

  return (
    <Page
      title="Catalog"
      actions={
        <>
          <Link
            to="/catalog/categories"
            aria-label="Categories"
            className="flex size-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <Tags className="size-5" aria-hidden />
          </Link>
          <IconButton icon={Plus} label="New item" onClick={() => setSheet({ isOpen: true })} />
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <SearchField
          label="Search the catalog"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {categories.data && (
          <CategoryFilter categories={categories.data} value={category} onChange={setCategory} />
        )}
      </div>
      <QueryState query={items}>
        {(data) => {
          if (data.length === 0) {
            return (
              <EmptyState icon={Package} title="Your catalog is empty">
                Add things you buy often, so they're one tap away on every list.
              </EmptyState>
            );
          }
          const filtered = filterItems(data, search, category);
          if (filtered.length === 0) {
            return <p className="py-6 text-center text-muted-foreground">No matching items.</p>;
          }
          return (
            <ul className="-mx-3 flex flex-col">
              {filtered.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  category={item.categoryId ? categoryById.get(item.categoryId) : undefined}
                  onOpen={() => setSheet({ isOpen: true, item })}
                />
              ))}
            </ul>
          );
        }}
      </QueryState>
      <ItemSheet
        isOpen={sheet.isOpen}
        item={sheet.isOpen ? sheet.item : undefined}
        initialCategoryId={
          category === 'all' || category === 'uncategorized' ? undefined : category
        }
        onClose={() => setSheet({ isOpen: false })}
      />
    </Page>
  );
}
