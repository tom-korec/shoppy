import { z } from 'zod';

export const BULK_MAX_IDS = 500;

// Ids of the entries or history records a bulk action applies to, each at most once.
export const bulkIdsSchema = z
  .array(z.uuid())
  .min(1)
  .max(BULK_MAX_IDS)
  .refine((ids) => new Set(ids).size === ids.length, 'Each id may appear only once');

export const bulkResultSchema = z.object({ count: z.number().int() });
export type BulkResultDto = z.infer<typeof bulkResultSchema>;
