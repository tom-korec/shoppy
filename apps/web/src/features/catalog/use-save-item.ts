import { type CreateItemInput, type ItemDto, itemSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY } from '@/features/categories/use-categories';
import { LISTS_QUERY_KEY_ROOT } from '@/features/lists/list-query-keys';
import { apiSend } from '@/lib/api';
import { CATALOG_QUERY_KEY } from './use-items';

// Creates an item, or updates it when an existing one is passed. Entries show the item's name
// and category, and categories count their items, so those caches refresh too.
export function useSaveItem(item: ItemDto | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateItemInput) =>
      item
        ? apiSend('PATCH', `/items/${item.id}`, input, itemSchema)
        : apiSend('POST', '/scopes/personal/items', input, itemSchema),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
      ]),
  });
}
