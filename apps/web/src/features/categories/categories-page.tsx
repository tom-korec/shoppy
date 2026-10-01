import type { CategoryDto } from '@shoppy/shared';
import { Plus, Tags } from 'lucide-react';
import { useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { EmptyState } from '@/components/ui/empty-state';
import { FormAlert } from '@/components/ui/form-alert';
import { IconButton } from '@/components/ui/icon-button';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { CategorySheet } from './category-sheet';
import { SortableCategoryList } from './sortable-category-list';
import { useCategories } from './use-categories';
import { useReorderCategories } from './use-reorder-categories';

type SheetState = { isOpen: false } | { isOpen: true; category?: CategoryDto };

export function CategoriesPage() {
  const categories = useCategories();
  const reorder = useReorderCategories();
  const [sheet, setSheet] = useState<SheetState>({ isOpen: false });

  return (
    <Page
      title="Categories"
      leading={<BackLink to="/catalog" label="Back to catalog" />}
      actions={
        <IconButton icon={Plus} label="New category" onClick={() => setSheet({ isOpen: true })} />
      }
    >
      <p className="-mt-3 text-sm text-muted-foreground">
        Lists are grouped in this order. Drag the handle to match your shop.
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
              onReorder={(ordered) => reorder.mutate(ordered)}
              onOpen={(category) => setSheet({ isOpen: true, category })}
            />
          )
        }
      </QueryState>
      <CategorySheet
        isOpen={sheet.isOpen}
        category={sheet.isOpen ? sheet.category : undefined}
        onClose={() => setSheet({ isOpen: false })}
      />
    </Page>
  );
}
