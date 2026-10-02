import { z } from 'zod';
import { entrySchema } from './entries.js';
import { iconKeySchema } from './icons.js';
import { permissionSchema } from './permissions.js';
import { scopeRefSchema } from './scopes.js';
import { requiredNameSchema } from './text-fields.js';

export const LIST_NAME_MAX_LENGTH = 60;
export const LISTS_MAX_COUNT = 200;

export const listSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  icon: z.string(),
  isArchived: z.boolean(),
  entryCount: z.number().int(),
  scope: scopeRefSchema,
  createdAt: z.iso.datetime(),
  lastActivityAt: z.iso.datetime(),
});
export type ListDto = z.infer<typeof listSchema>;

export const listListSchema = z.array(listSchema);

// `permissions`: what the current user may do on this list (all of them on a personal list).
export const listDetailSchema = listSchema.extend({
  entries: z.array(entrySchema),
  permissions: z.array(permissionSchema),
});
export type ListDetailDto = z.infer<typeof listDetailSchema>;

export const createListInputSchema = z.object({
  name: requiredNameSchema(LIST_NAME_MAX_LENGTH),
  icon: iconKeySchema,
});
export type CreateListInput = z.infer<typeof createListInputSchema>;

export const updateListInputSchema = createListInputSchema
  .partial()
  .extend({ isArchived: z.boolean().optional() });
export type UpdateListInput = z.infer<typeof updateListInputSchema>;

export const LIST_SORTS = ['ACTIVITY', 'CREATED', 'CUSTOM'] as const;
export const listSortSchema = z.enum(LIST_SORTS);
export type ListSort = z.infer<typeof listSortSchema>;

// The user's Lists screen settings, kept in the account.
export const listViewSchema = z.object({
  isGrouped: z.boolean(),
  sort: listSortSchema,
  customOrder: z.array(z.uuid()),
});
export type ListViewDto = z.infer<typeof listViewSchema>;

export const updateListViewInputSchema = z.object({
  isGrouped: z.boolean().optional(),
  sort: listSortSchema.optional(),
});
export type UpdateListViewInput = z.infer<typeof updateListViewInputSchema>;

export const reorderListsInputSchema = z.object({
  ids: z
    .array(z.uuid())
    .max(1000)
    .refine((ids) => new Set(ids).size === ids.length, 'Each list may appear only once'),
});
export type ReorderListsInput = z.infer<typeof reorderListsInputSchema>;
