import { z } from 'zod';
import { iconKeySchema } from './icons.js';
import { requiredNameSchema } from './text-fields.js';

export interface CategorySeed {
  name: string;
  icon: string;
}

// Seeded into every new personal scope (FR-C1) and household (FR-C2), in shop walking order.
export const DEFAULT_CATEGORIES: readonly CategorySeed[] = [
  { name: 'Fruit & vegetables', icon: 'apple' },
  { name: 'Bakery', icon: 'croissant' },
  { name: 'Dairy & eggs', icon: 'milk' },
  { name: 'Meat & fish', icon: 'beef' },
  { name: 'Pantry & frozen', icon: 'wheat' },
  { name: 'Drinks', icon: 'cup-soda' },
  { name: 'Household & care', icon: 'spray-can' },
  { name: 'Other', icon: 'shopping-basket' },
];

export const CATEGORY_NAME_MAX_LENGTH = 40;
export const CATEGORIES_MAX_COUNT = 100;

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  icon: z.string(),
  position: z.number().int(),
  itemCount: z.number().int(),
});
export type CategoryDto = z.infer<typeof categorySchema>;

export const categoryListSchema = z.array(categorySchema);

export const createCategoryInputSchema = z.object({
  name: requiredNameSchema(CATEGORY_NAME_MAX_LENGTH),
  icon: iconKeySchema,
});
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = createCategoryInputSchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// The full new order: every category of the scope, each exactly once.
export const reorderCategoriesInputSchema = z.object({
  ids: z
    .array(z.uuid())
    .min(1)
    .max(CATEGORIES_MAX_COUNT)
    .refine((ids) => new Set(ids).size === ids.length, 'Each category may appear only once'),
});
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesInputSchema>;
