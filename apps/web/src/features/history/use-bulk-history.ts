import { type BulkHistoryInput, bulkResultSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listMutationOptions, settleList } from '@/features/entries/list-cache';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { removeCachedRecords, rollbackRecords } from './history-cache';

const DONE: Record<BulkHistoryInput['action'], string> = {
  restore: 'moved back to the list',
  readd: 'added to the list',
  delete: 'deleted from history',
};

export function useBulkHistory(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (input: BulkHistoryInput) =>
      apiSend('POST', `/lists/${listId}/history/bulk`, input, bulkResultSchema),
    onMutate: ({ action, ids }) =>
      action === 'readd' ? undefined : removeCachedRecords(queryClient, listId, ids),
    onSuccess: ({ count }, { action }) => {
      toastStore.show(`${count} ${count === 1 ? 'entry' : 'entries'} ${DONE[action]}`);
    },
    onError: (error, _input, snapshot) => {
      rollbackRecords(queryClient, listId, snapshot);
      toastStore.show(error.message);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
