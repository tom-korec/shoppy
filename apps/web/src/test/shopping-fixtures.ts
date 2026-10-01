import type {
  CategoryDto,
  EntryDto,
  ItemDto,
  ListDetailDto,
  PurchaseRecordDto,
  RecentHistoryDto,
} from '@shoppy/shared';

export const LIST_ID = '01999d6c-6c4a-7c39-9a3f-000000000001';
export const DAIRY_ID = '01999d6c-6c4a-7c39-9a3f-000000000002';

export function buildCategory(overrides: Partial<CategoryDto> = {}): CategoryDto {
  return {
    id: DAIRY_ID,
    name: 'Dairy & eggs',
    icon: 'milk',
    position: 0,
    itemCount: 1,
    ...overrides,
  };
}

export function buildItem(overrides: Partial<ItemDto> = {}): ItemDto {
  return {
    id: '01999d6c-6c4a-7c39-9a3f-000000000003',
    name: 'Milk',
    description: null,
    categoryId: DAIRY_ID,
    ...overrides,
  };
}

export function buildEntry(overrides: Partial<EntryDto> = {}): EntryDto {
  return {
    id: '01999d6c-6c4a-7c39-9a3f-000000000004',
    listId: LIST_ID,
    itemId: null,
    name: 'Candles',
    note: null,
    categoryId: null,
    isChecked: false,
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

export function buildList(
  entries: EntryDto[] = [],
  overrides: Partial<ListDetailDto> = {},
): ListDetailDto {
  return {
    id: LIST_ID,
    name: 'Weekly shop',
    icon: 'shopping-cart',
    isArchived: false,
    entryCount: entries.length,
    createdAt: '2026-10-01T12:00:00.000Z',
    entries,
    ...overrides,
  };
}

export function buildRecord(overrides: Partial<PurchaseRecordDto> = {}): PurchaseRecordDto {
  return {
    id: '01999d6c-6c4a-7c39-9a3f-000000000030',
    listId: LIST_ID,
    itemId: null,
    name: 'Bread',
    categoryName: null,
    note: null,
    boughtBy: null,
    boughtAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

export const NO_RECENT_HISTORY: RecentHistoryDto = { records: [], windowDays: 30 };
