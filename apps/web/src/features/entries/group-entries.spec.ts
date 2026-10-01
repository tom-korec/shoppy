import type { CategoryDto, EntryDto } from '@shoppy/shared';
import { groupEntries } from './group-entries';

function category(name: string, position: number): CategoryDto {
  return { id: crypto.randomUUID(), name, icon: 'tag', position, itemCount: 0 };
}

function entry(name: string, categoryId: string | null): EntryDto {
  return {
    id: crypto.randomUUID(),
    listId: crypto.randomUUID(),
    itemId: null,
    name,
    note: null,
    categoryId,
    isChecked: false,
    createdAt: '2026-10-01T12:00:00.000Z',
  };
}

describe('groupEntries', () => {
  const bakery = category('Bakery', 1);
  const fruit = category('Fruit', 0);
  const drinks = category('Drinks', 2);

  it('puts uncategorized entries first, then categories in their order, skipping empty ones', () => {
    const entries = [entry('Bread', bakery.id), entry('Candles', null), entry('Apples', fruit.id)];

    const groups = groupEntries(entries, [bakery, drinks, fruit]);

    expect(groups.map(({ category }) => category?.name ?? null)).toEqual([null, 'Fruit', 'Bakery']);
    expect(groups[0]?.entries.map(({ name }) => name)).toEqual(['Candles']);
  });

  it('treats a deleted category as uncategorized', () => {
    const groups = groupEntries([entry('Milk', crypto.randomUUID())], [bakery]);

    expect(groups).toEqual([expect.objectContaining({ category: null })]);
  });
});
