import type { ListDetailDto } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listMutationOptions, settleList } from '@/features/entries/list-cache';
import { listDetailKey } from '@/features/lists/list-query-keys';
import { apiCommand } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { DASHBOARD_QUERY_KEY } from './use-dashboard';

// Runs in the list's mutation scope and only touches `isFavorite`, so entry changes made in the
// meantime are neither refetched away nor rolled back with it.
export function useToggleFavorite(listId: string) {
  const queryClient = useQueryClient();
  const setFavorite = (isFavorite: boolean) =>
    queryClient.setQueryData<ListDetailDto>(
      listDetailKey(listId),
      (list) => list && { ...list, isFavorite },
    );

  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (isFavorite: boolean) =>
      isFavorite
        ? apiCommand('POST', '/me/favorites', { listId })
        : apiCommand('DELETE', `/me/favorites/${listId}`),
    onMutate: (isFavorite) => setFavorite(isFavorite),
    onError: (error, isFavorite) => {
      setFavorite(!isFavorite);
      toastStore.show(`Couldn't update favorites: ${error.message}`);
    },
    onSettled: () =>
      Promise.all([
        settleList(queryClient, listId),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
      ]),
  });
}
