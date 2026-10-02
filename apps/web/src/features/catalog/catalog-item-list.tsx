import type { CategoryDto, ItemDto } from '@shoppy/shared';
import { CheckCircle } from '@/components/ui/check-circle';
import type { Selection } from '@/features/entries/use-selection';
import { type CategoryFilterValue, filterItems } from './filter-items';
import { ItemRow } from './item-row';

interface CatalogItemListProps {
  items: ItemDto[];
  categories: CategoryDto[];
  query: string;
  category: CategoryFilterValue;
  selection: Selection;
  onOpen?: (item: ItemDto) => void;
}

export function CatalogItemList({
  items,
  categories,
  query,
  category,
  selection,
  onOpen,
}: CatalogItemListProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const filtered = filterItems(items, query, category);
  if (filtered.length === 0) {
    return <p className="py-6 text-center text-muted-foreground">No matching items.</p>;
  }

  return (
    <ul className="-mx-3 flex flex-col lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-2 xl:grid-cols-3">
      {filtered.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          category={item.categoryId ? categoryById.get(item.categoryId) : undefined}
          control={
            selection.isSelecting && (
              <CheckCircle
                label={`Select ${item.name}`}
                isChecked={selection.isSelected(item.id)}
                onToggle={() => selection.toggle(item.id)}
              />
            )
          }
          onOpen={
            selection.isSelecting ? () => selection.toggle(item.id) : onOpen && (() => onOpen(item))
          }
        />
      ))}
    </ul>
  );
}
