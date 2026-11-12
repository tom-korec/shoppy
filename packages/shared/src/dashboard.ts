import { z } from 'zod';
import { listSchema } from './lists.js';

export const FAVORITES_MAX_COUNT = 50;
export const RECENT_LISTS_COUNT = 5;

// FR-D2/D3: the user's favorites in their own order, then the lists they opened most recently
// (archived lists and favorites left out).
export const dashboardSchema = z.object({
  favorites: z.array(listSchema),
  recent: z.array(listSchema),
});
export type DashboardDto = z.infer<typeof dashboardSchema>;

export const addFavoriteInputSchema = z.object({ listId: z.uuid() });
export type AddFavoriteInput = z.infer<typeof addFavoriteInputSchema>;

export const reorderFavoritesInputSchema = z.object({
  ids: z
    .array(z.uuid())
    .max(FAVORITES_MAX_COUNT)
    .refine((ids) => new Set(ids).size === ids.length, 'Each list may appear only once'),
});
export type ReorderFavoritesInput = z.infer<typeof reorderFavoritesInputSchema>;
