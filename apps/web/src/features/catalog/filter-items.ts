import type { ItemDto } from '@shoppy/shared';
import { normalizeForSearch } from '@/lib/normalize-for-search';

// A category id, or one of the two special filters.
export type CategoryFilterValue = 'all' | 'uncategorized' | (string & {});

export function filterItems(
  items: ItemDto[],
  search: string,
  category: CategoryFilterValue,
): ItemDto[] {
  const query = normalizeForSearch(search);
  return items.filter((item) => {
    const matchesCategory =
      category === 'all' ||
      (category === 'uncategorized' ? item.categoryId === null : item.categoryId === category);
    return matchesCategory && normalizeForSearch(item.name).includes(query);
  });
}
