import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listMutationOptions, settleList } from '@/features/entries/list-cache';
import { apiCommand } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { removeCachedRecords, rollbackRecords } from './history-cache';

export function useDeleteRecord(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (recordId: string) => apiCommand('DELETE', `/history/${recordId}`),
    onMutate: (recordId) => removeCachedRecords(queryClient, listId, [recordId]),
    onError: (error, _recordId, snapshot) => {
      rollbackRecords(queryClient, listId, snapshot);
      toastStore.show(`Couldn't delete: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
