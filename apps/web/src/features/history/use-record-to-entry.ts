import { type EntryDto, entrySchema, type PurchaseRecordDto } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  insertById,
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from '@/features/entries/list-cache';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { removeCachedRecords, rollbackRecords } from './history-cache';

export interface RecordToEntry {
  record: PurchaseRecordDto;
  optimistic: EntryDto;
}

// Restore moves the record back onto the list; re-add copies it and keeps the record.
export function useRecordToEntry(listId: string, mode: 'restore' | 'readd') {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: ({ record, optimistic }: RecordToEntry) =>
      apiSend('POST', `/history/${record.id}/${mode}`, { entryId: optimistic.id }, entrySchema),
    onMutate: async ({ record, optimistic }) => {
      const entries = await updateCachedEntries(queryClient, listId, (current) =>
        insertById(current, optimistic),
      );
      const records =
        mode === 'restore'
          ? await removeCachedRecords(queryClient, listId, [record.id])
          : undefined;
      return { entries, records };
    },
    onError: (error, _variables, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot?.entries);
      rollbackRecords(queryClient, listId, snapshot?.records);
      toastStore.show(`Couldn't add it back: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
