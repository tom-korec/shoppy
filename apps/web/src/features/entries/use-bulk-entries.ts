import { type BulkEntriesInput, bulkResultSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';

export function useBulkEntries(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (input: BulkEntriesInput) =>
      apiSend('POST', `/lists/${listId}/entries/bulk`, input, bulkResultSchema),
    onMutate: ({ ids }) =>
      updateCachedEntries(queryClient, listId, (entries) =>
        ids ? entries.filter((entry) => !ids.includes(entry.id)) : [],
      ),
    onSuccess: ({ count }, { action }) => {
      const noun = count === 1 ? 'entry' : 'entries';
      toastStore.show(
        action === 'check' ? `${count} ${noun} moved to history` : `${count} ${noun} deleted`,
      );
    },
    onError: (error, _input, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(error.message);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
