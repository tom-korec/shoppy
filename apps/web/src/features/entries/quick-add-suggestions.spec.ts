import type { ItemDto, PurchaseRecordDto } from '@shoppy/shared';
import { findItemByName, quickAddSuggestions } from './quick-add-suggestions';

function item(name: string): ItemDto {
  return { id: crypto.randomUUID(), name, description: null, categoryId: null };
}

function record(name: string, categoryName: string | null = null): PurchaseRecordDto {
  return {
    id: crypto.randomUUID(),
    listId: crypto.randomUUID(),
    itemId: null,
    name,
    categoryName,
    note: null,
    boughtBy: null,
    boughtAt: '2026-10-01T12:00:00.000Z',
  };
}

const names = (suggestions: ReturnType<typeof quickAddSuggestions>) =>
  suggestions.map((s) => (s.kind === 'item' ? s.item.name : s.name));

describe('quickAddSuggestions', () => {
  it('lists catalog items starting with the text before those containing it', () => {
    const items = [item('Oat milk'), item('Milk'), item('Bread')];

    expect(names(quickAddSuggestions('mil', items, []))).toEqual(['Milk', 'Oat milk']);
  });

  it('adds recent one-time purchases that are not in the catalog, once each', () => {
    const records = [record('Milk'), record('Mild salsa', 'Pantry'), record('mild salsa')];

    const suggestions = quickAddSuggestions('mil', [item('Milk')], records);

    expect(suggestions).toEqual([
      expect.objectContaining({ kind: 'item' }),
      { kind: 'history', name: 'Mild salsa', categoryName: 'Pantry' },
    ]);
  });

  it('suggests nothing for blank text', () => {
    expect(quickAddSuggestions('  ', [item('Milk')], [])).toEqual([]);
  });
});

describe('findItemByName', () => {
  it('matches the whole name, ignoring case', () => {
    const milk = item('Milk');

    expect(findItemByName([item('Oat milk'), milk], 'MILK')).toBe(milk);
  });
});
