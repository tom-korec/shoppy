import { type ListDto, listSchema, type UpdateListInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { LISTS_QUERY_KEY_ROOT } from './list-query-keys';

export function useSaveList(list: ListDto | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListInput) =>
      list
        ? apiSend('PATCH', `/lists/${list.id}`, input, listSchema)
        : apiSend('POST', '/scopes/personal/lists', input, listSchema),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
  });
}
