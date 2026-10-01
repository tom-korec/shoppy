import { entrySchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  insertById,
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';
import type { NewEntry } from './new-entry';

export function useAddEntry(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: ({ input }: NewEntry) =>
      apiSend('POST', `/lists/${listId}/entries`, input, entrySchema),
    onMutate: ({ optimistic }) =>
      updateCachedEntries(queryClient, listId, (entries) => insertById(entries, optimistic)),
    onError: (error, { optimistic }, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(`Couldn't add ${optimistic.name}: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
