import type { EntryDto } from '@shoppy/shared';
import type { ListEntry } from '../../generated/prisma/client.js';

export const ENTRY_DTO_INCLUDE = { item: { select: { name: true, categoryId: true } } } as const;

type EntryRow = ListEntry & { item: { name: string; categoryId: string | null } | null };

// Catalog entries take name and category from their item; one-time entries carry their own.
export function toEntryDto(entry: EntryRow): EntryDto {
  return {
    id: entry.id,
    listId: entry.listId,
    itemId: entry.itemId,
    name: entry.item?.name ?? entry.text ?? '',
    note: entry.note,
    categoryId: entry.item ? entry.item.categoryId : entry.categoryId,
    isChecked: entry.checkedAt !== null,
    createdAt: entry.createdAt.toISOString(),
  };
}
