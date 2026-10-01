import { z } from 'zod';
import { ITEM_NAME_MAX_LENGTH } from './items.js';
import { bulkIdsSchema } from './bulk.js';
import { optionalTextSchema, requiredNameSchema } from './text-fields.js';

export const ENTRY_NOTE_MAX_LENGTH = 200;
export const ENTRIES_MAX_PER_LIST = 500;

export const entrySchema = z.object({
  id: z.uuid(),
  listId: z.uuid(),
  itemId: z.uuid().nullable(),
  name: z.string(),
  note: z.string().nullable(),
  categoryId: z.uuid().nullable(),
  isChecked: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type EntryDto = z.infer<typeof entrySchema>;

const entryNoteSchema = optionalTextSchema(ENTRY_NOTE_MAX_LENGTH);

// Entries are listed in id order. A client-chosen id must be a UUIDv7 (time-ordered), so an
// optimistic entry keeps its id and place once saved.
export const entryIdSchema = z.uuid({ version: 'v7', message: 'Use a UUIDv7 id' });

// A catalog entry names its item; a one-time entry carries its own text and optional category.
export const createEntryInputSchema = z
  .object({
    id: entryIdSchema.optional(),
    itemId: z.uuid().optional(),
    text: requiredNameSchema(ITEM_NAME_MAX_LENGTH).optional(),
    categoryId: z.uuid().nullable().optional(),
    note: entryNoteSchema.optional(),
  })
  .refine((input) => (input.itemId === undefined) !== (input.text === undefined), {
    message: 'Add either a catalog item or a name',
  })
  .refine((input) => input.itemId === undefined || input.categoryId == null, {
    message: 'Only one-time entries have their own category',
    path: ['categoryId'],
  });
export type CreateEntryInput = z.infer<typeof createEntryInputSchema>;

export const updateEntryInputSchema = z.object({
  note: entryNoteSchema.optional(),
  categoryId: z.uuid().nullable().optional(),
  isChecked: z.boolean().optional(),
});
export type UpdateEntryInput = z.infer<typeof updateEntryInputSchema>;

export const promoteEntryInputSchema = z.object({
  categoryId: z.uuid().nullable().optional(),
});
export type PromoteEntryInput = z.infer<typeof promoteEntryInputSchema>;

export const bulkEntriesInputSchema = z
  .object({
    action: z.enum(['check', 'delete']),
    ids: bulkIdsSchema.optional(),
    all: z.literal(true).optional(),
  })
  .refine((input) => (input.ids === undefined) !== (input.all === undefined), {
    message: 'Pick entries or all of them',
  });
export type BulkEntriesInput = z.infer<typeof bulkEntriesInputSchema>;

// "Milk, 2 l" → name "Milk", note "2 l" (quick add).
export function splitQuickAddText(text: string): { name: string; note: string | null } {
  const commaIndex = text.indexOf(',');
  if (commaIndex === -1) return { name: text.trim(), note: null };
  return {
    name: text.slice(0, commaIndex).trim(),
    note: text.slice(commaIndex + 1).trim() || null,
  };
}
