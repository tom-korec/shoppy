import { z } from 'zod';
import { entrySchema } from './entries.js';
import { iconKeySchema } from './icons.js';
import { requiredNameSchema } from './text-fields.js';

export const LIST_NAME_MAX_LENGTH = 60;
export const LISTS_MAX_COUNT = 200;

export const listSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  icon: z.string(),
  isArchived: z.boolean(),
  entryCount: z.number().int(),
  createdAt: z.iso.datetime(),
});
export type ListDto = z.infer<typeof listSchema>;

export const listListSchema = z.array(listSchema);

export const listDetailSchema = listSchema.extend({ entries: z.array(entrySchema) });
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
