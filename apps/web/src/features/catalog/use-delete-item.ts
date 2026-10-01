import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY } from '@/features/categories/use-categories';
import { LISTS_QUERY_KEY_ROOT } from '@/features/lists/list-query-keys';
import { apiCommand } from '@/lib/api';
import { CATALOG_QUERY_KEY } from './use-items';

// Entries of the item stay on their lists as one-time entries (FR-I6).
export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => apiCommand('DELETE', `/items/${itemId}`),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
      ]),
  });
}
