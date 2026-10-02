import { type ListViewDto, listViewSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { LIST_VIEW_QUERY_KEY } from './list-query-keys';

export function useReorderLists() {
  const queryClient = useQueryClient();
  return useMutation({
    scope: { id: 'lists:reorder' },
    mutationFn: (ids: string[]) => apiSend('PUT', '/me/list-view/order', { ids }, listViewSchema),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: LIST_VIEW_QUERY_KEY });
      const previous = queryClient.getQueryData<ListViewDto>(LIST_VIEW_QUERY_KEY);
      if (previous)
        queryClient.setQueryData(LIST_VIEW_QUERY_KEY, { ...previous, customOrder: ids });
      return { previous };
    },
    onError: (_error, _ids, context) => {
      queryClient.setQueryData(LIST_VIEW_QUERY_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LIST_VIEW_QUERY_KEY }),
  });
}
