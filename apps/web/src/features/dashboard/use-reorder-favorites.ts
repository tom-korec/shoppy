import type { DashboardDto } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { DASHBOARD_QUERY_KEY } from './use-dashboard';

export function useReorderFavorites() {
  const queryClient = useQueryClient();
  return useMutation({
    scope: { id: 'favorites:reorder' },
    mutationFn: (ids: string[]) => apiCommand('PUT', '/me/favorites/order', { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });
      const previous = queryClient.getQueryData<DashboardDto>(DASHBOARD_QUERY_KEY);
      if (previous) {
        const byId = new Map(previous.favorites.map((list) => [list.id, list]));
        const favorites = ids.flatMap((id) => byId.get(id) ?? []);
        queryClient.setQueryData(DASHBOARD_QUERY_KEY, { ...previous, favorites });
      }
      return { previous };
    },
    onError: (error, _ids, context) => {
      queryClient.setQueryData(DASHBOARD_QUERY_KEY, context?.previous);
      toastStore.show(`Couldn't save the order: ${error.message}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
  });
}
