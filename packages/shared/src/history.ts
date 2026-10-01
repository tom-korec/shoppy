import { z } from 'zod';
import { entryIdSchema } from './entries.js';
import { bulkIdsSchema } from './bulk.js';

export const purchaseRecordSchema = z.object({
  id: z.uuid(),
  listId: z.uuid(),
  itemId: z.uuid().nullable(),
  name: z.string(),
  categoryName: z.string().nullable(),
  note: z.string().nullable(),
  boughtBy: z.object({ id: z.uuid(), displayName: z.string() }).nullable(),
  boughtAt: z.iso.datetime(),
});
export type PurchaseRecordDto = z.infer<typeof purchaseRecordSchema>;

export const HISTORY_PAGE_MAX_SIZE = 100;
export const HISTORY_PAGE_DEFAULT_SIZE = 50;

export const historyQuerySchema = z.object({
  cursor: z.string().max(100).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(HISTORY_PAGE_MAX_SIZE)
    .default(HISTORY_PAGE_DEFAULT_SIZE),
});
export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const historyPageSchema = z.object({
  records: z.array(purchaseRecordSchema),
  nextCursor: z.string().nullable(),
});
export type HistoryPageDto = z.infer<typeof historyPageSchema>;

// FR-L12: 7 days on a busy list (10th newest record within 7 days), otherwise 30.
export const RECENT_HISTORY_WINDOWS_DAYS = { busy: 7, quiet: 30 } as const;
export const RECENT_HISTORY_BUSY_THRESHOLD = 10;

export const recentHistorySchema = z.object({
  records: z.array(purchaseRecordSchema),
  windowDays: z.union([z.literal(7), z.literal(30)]),
});
export type RecentHistoryDto = z.infer<typeof recentHistorySchema>;

// Restore and re-add create an entry; the client may choose its id (optimistic updates).
export const historyToEntryInputSchema = z.object({ entryId: entryIdSchema.optional() });
export type HistoryToEntryInput = z.infer<typeof historyToEntryInputSchema>;

export const bulkHistoryInputSchema = z.object({
  action: z.enum(['restore', 'readd', 'delete']),
  ids: bulkIdsSchema,
});
export type BulkHistoryInput = z.infer<typeof bulkHistoryInputSchema>;
