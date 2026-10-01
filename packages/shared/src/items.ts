import { z } from 'zod';
import { optionalTextSchema, requiredNameSchema } from './text-fields.js';

export const ITEM_NAME_MAX_LENGTH = 80;
export const ITEM_DESCRIPTION_MAX_LENGTH = 200;
export const ITEMS_MAX_COUNT = 2000;

export const itemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  categoryId: z.uuid().nullable(),
});
export type ItemDto = z.infer<typeof itemSchema>;

export const itemListSchema = z.array(itemSchema);

export const createItemInputSchema = z.object({
  name: requiredNameSchema(ITEM_NAME_MAX_LENGTH),
  description: optionalTextSchema(ITEM_DESCRIPTION_MAX_LENGTH).optional(),
  categoryId: z.uuid().nullable().optional(),
});
export type CreateItemInput = z.infer<typeof createItemInputSchema>;

export const updateItemInputSchema = createItemInputSchema.partial();
export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;
