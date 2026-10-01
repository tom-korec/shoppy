import { bulkResultSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';

export function useFinishShopping(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: () =>
      apiSend('POST', `/lists/${listId}/finish-shopping`, undefined, bulkResultSchema),
    onMutate: () =>
      updateCachedEntries(queryClient, listId, (entries) => entries.filter((e) => !e.isChecked)),
    onSuccess: ({ count }) => {
      toastStore.show(`${count} ${count === 1 ? 'entry' : 'entries'} moved to history`);
    },
    onError: (error, _input, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(error.message);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
