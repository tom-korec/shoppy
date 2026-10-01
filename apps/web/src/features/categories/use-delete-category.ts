import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { CATALOG_QUERY_KEY } from '@/features/catalog/use-items';
import { LISTS_QUERY_KEY_ROOT } from '@/features/lists/list-query-keys';
import { CATEGORIES_QUERY_KEY } from './use-categories';

// Items and entries of the category become uncategorized, so their caches refresh too.
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => apiCommand('DELETE', `/categories/${categoryId}`),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
      ]),
  });
}
