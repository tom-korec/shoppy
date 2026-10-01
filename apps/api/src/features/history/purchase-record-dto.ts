import type { PurchaseRecordDto } from '@shoppy/shared';
import type { PurchaseRecord } from '../../generated/prisma/client.js';

export const PURCHASE_RECORD_DTO_INCLUDE = {
  boughtBy: { select: { id: true, displayName: true } },
} as const;

type PurchaseRecordRow = PurchaseRecord & { boughtBy: { id: string; displayName: string } | null };

export function toPurchaseRecordDto(record: PurchaseRecordRow): PurchaseRecordDto {
  return {
    id: record.id,
    listId: record.listId,
    itemId: record.itemId,
    name: record.nameSnapshot,
    categoryName: record.categorySnapshot,
    note: record.note,
    boughtBy: record.boughtBy,
    boughtAt: record.boughtAt.toISOString(),
  };
}
