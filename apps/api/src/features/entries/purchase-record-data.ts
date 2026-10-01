import type { Prisma } from '../../generated/prisma/client.js';

export const ENTRY_PURCHASE_INCLUDE = {
  item: { select: { name: true, category: { select: { name: true } } } },
  category: { select: { name: true } },
} as const;

type EntryForPurchase = Prisma.ListEntryGetPayload<{ include: typeof ENTRY_PURCHASE_INCLUDE }>;

interface Purchase {
  boughtById: string | null;
  boughtAt: Date;
}

// Names are snapshotted so history survives renaming or deleting the item and category.
export function toPurchaseRecordData(
  entry: EntryForPurchase,
  { boughtById, boughtAt }: Purchase,
): Prisma.PurchaseRecordCreateManyInput {
  const category = entry.item ? entry.item.category : entry.category;
  return {
    listId: entry.listId,
    itemId: entry.itemId,
    nameSnapshot: entry.item?.name ?? entry.text ?? '',
    categorySnapshot: category?.name ?? null,
    note: entry.note,
    boughtById,
    boughtAt,
  };
}
