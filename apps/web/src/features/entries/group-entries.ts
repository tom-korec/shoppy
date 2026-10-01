import type { CategoryDto, EntryDto } from '@shoppy/shared';

export interface EntryGroup {
  key: string;
  category: CategoryDto | null;
  entries: EntryDto[];
}

// FR-L9: grouped in category order. Entries without a (still existing) category come first.
export function groupEntries(entries: EntryDto[], categories: CategoryDto[]): EntryGroup[] {
  const known = new Set(categories.map(({ id }) => id));
  const uncategorized = entries.filter(({ categoryId }) => !categoryId || !known.has(categoryId));
  const groups: EntryGroup[] = [...categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      key: category.id,
      category,
      entries: entries.filter(({ categoryId }) => categoryId === category.id),
    }));

  return [{ key: 'uncategorized', category: null, entries: uncategorized }, ...groups].filter(
    (group) => group.entries.length > 0,
  );
}
