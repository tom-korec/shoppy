import type { EntryDto } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';
import { recreateEntry } from './new-entry';
import { useAddEntry } from './use-add-entry';

export function useDeleteEntry(listId: string) {
  const queryClient = useQueryClient();
  const addEntry = useAddEntry(listId);
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: (entry: EntryDto) => apiCommand('DELETE', `/entries/${entry.id}`),
    onMutate: (deleted) =>
      updateCachedEntries(queryClient, listId, (entries) =>
        entries.filter((entry) => entry.id !== deleted.id),
      ),
    onSuccess: (_result, entry) => {
      toastStore.show(`Deleted ${entry.name}`, {
        label: 'Undo',
        onClick: () => addEntry.mutate(recreateEntry(entry)),
      });
    },
    onError: (error, _entry, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(`Couldn't delete: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
