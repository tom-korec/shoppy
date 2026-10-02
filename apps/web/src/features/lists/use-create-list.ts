import { type CreateListInput, listSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ScopeKey, scopePath } from '@/features/households/scope-key';
import { apiSend } from '@/lib/api';
import { LISTS_QUERY_KEY_ROOT } from './list-query-keys';

interface NewList {
  scope: ScopeKey;
  input: CreateListInput;
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scope, input }: NewList) =>
      apiSend('POST', `${scopePath(scope)}/lists`, input, listSchema),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
  });
}
