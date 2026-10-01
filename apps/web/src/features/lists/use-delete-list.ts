import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { LISTS_QUERY_KEY, listDetailKey } from './list-query-keys';

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => apiCommand('DELETE', `/lists/${listId}`),
    onSuccess: (_result, listId) => {
      queryClient.removeQueries({ queryKey: listDetailKey(listId) });
      return queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY });
    },
  });
}
