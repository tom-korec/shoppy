import { type ListViewDto, listViewSchema, type UpdateListViewInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { LIST_VIEW_QUERY_KEY } from './list-query-keys';

export function useUpdateListView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListViewInput) =>
      apiSend('PATCH', '/me/list-view', input, listViewSchema),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: LIST_VIEW_QUERY_KEY });
      const previous = queryClient.getQueryData<ListViewDto>(LIST_VIEW_QUERY_KEY);
      if (previous) queryClient.setQueryData(LIST_VIEW_QUERY_KEY, { ...previous, ...input });
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(LIST_VIEW_QUERY_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LIST_VIEW_QUERY_KEY }),
  });
}
