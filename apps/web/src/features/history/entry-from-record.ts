import {
  type CategoryDto,
  type EntryDto,
  type ItemDto,
  type PurchaseRecordDto,
  uuidV7,
} from '@shoppy/shared';

// The optimistic entry for restore / re-add, mirroring what the API will create: the catalog
// item if it still exists, else a one-time entry in the category of the same name.
export function entryFromRecord(
  record: PurchaseRecordDto,
  items: ItemDto[],
  categories: CategoryDto[],
): EntryDto {
  const item = record.itemId ? items.find(({ id }) => id === record.itemId) : undefined;
  const categoryName = record.categoryName?.toLowerCase();
  const category = categories.find(({ name }) => name.toLowerCase() === categoryName);
  return {
    id: uuidV7(),
    listId: record.listId,
    itemId: record.itemId,
    name: item?.name ?? record.name,
    note: record.note,
    categoryId: item ? item.categoryId : (category?.id ?? null),
    isChecked: false,
    createdAt: new Date().toISOString(),
  };
}
