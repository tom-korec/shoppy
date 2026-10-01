import type { ItemDto } from '@shoppy/shared';
import { filterItems } from './filter-items';

const DAIRY = '0199a1b2-c3d4-7e5f-8a9b-000000000001';

function item(name: string, categoryId: string | null = null): ItemDto {
  return { id: crypto.randomUUID(), name, description: null, categoryId };
}

const items = [item('Milk', DAIRY), item('Crème fraîche', DAIRY), item('Bin bags')];

describe('filterItems', () => {
  it('finds items by part of the name, ignoring case and accents', () => {
    expect(filterItems(items, 'CREME', 'all').map(({ name }) => name)).toEqual(['Crème fraîche']);
  });

  it('filters by category', () => {
    expect(filterItems(items, '', DAIRY)).toHaveLength(2);
  });

  it('filters items without a category', () => {
    expect(filterItems(items, '', 'uncategorized').map(({ name }) => name)).toEqual(['Bin bags']);
  });
});
