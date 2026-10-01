import type { ItemDto, PurchaseRecordDto } from '@shoppy/shared';
import { normalizeForSearch } from '@/lib/normalize-for-search';

export type Suggestion =
  { kind: 'item'; item: ItemDto } | { kind: 'history'; name: string; categoryName: string | null };

const MAX_SUGGESTIONS = 6;

// FR-L6: catalog items first (names starting with the text before names containing it), then
// one-time things bought recently on this list that aren't in the catalog.
export function quickAddSuggestions(
  text: string,
  items: ItemDto[],
  recentRecords: PurchaseRecordDto[],
): Suggestion[] {
  const query = normalizeForSearch(text);
  if (!query) return [];

  const matchingItems = items
    .map((item) => ({ item, name: normalizeForSearch(item.name) }))
    .filter(({ name }) => name.includes(query))
    .sort((a, b) => Number(!a.name.startsWith(query)) - Number(!b.name.startsWith(query)))
    .map(({ item }): Suggestion => ({ kind: 'item', item }));

  const catalogNames = new Set(items.map(({ name }) => normalizeForSearch(name)));
  const historyNames = new Map<string, Suggestion>();
  for (const record of recentRecords) {
    const name = normalizeForSearch(record.name);
    if (!name.includes(query) || catalogNames.has(name) || historyNames.has(name)) continue;
    historyNames.set(name, {
      kind: 'history',
      name: record.name,
      categoryName: record.categoryName,
    });
  }

  return [...matchingItems, ...historyNames.values()].slice(0, MAX_SUGGESTIONS);
}

export function findItemByName(items: ItemDto[], name: string): ItemDto | undefined {
  const normalized = normalizeForSearch(name);
  return items.find((item) => normalizeForSearch(item.name) === normalized);
}
