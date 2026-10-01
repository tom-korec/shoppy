import { type EntryDto, purchaseRecordSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRestoreRecord } from '@/features/history/use-restore-record';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';

// Planning view: a checked entry goes straight to history; Undo restores it.
export function useCheckEntry(listId: string) {
  const queryClient = useQueryClient();
  const restore = useRestoreRecord(listId);
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (entry: EntryDto) =>
      apiSend('POST', `/entries/${entry.id}/check`, undefined, purchaseRecordSchema),
    onMutate: (checked) =>
      updateCachedEntries(queryClient, listId, (entries) =>
        entries.filter((entry) => entry.id !== checked.id),
      ),
    onSuccess: (record, entry) => {
      toastStore.show(entry.name, {
        label: 'Undo',
        onClick: () => restore.mutate({ record, optimistic: { ...entry, isChecked: false } }),
      });
    },
    onError: (error, _entry, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(`Couldn't check: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
