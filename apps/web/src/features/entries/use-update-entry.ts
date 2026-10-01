import { type EntryDto, entrySchema, type UpdateEntryInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import {
  listMutationOptions,
  rollbackEntries,
  settleList,
  updateCachedEntries,
} from './list-cache';

interface EntryUpdate {
  entryId: string;
  input: UpdateEntryInput;
}

function applyUpdate(entry: EntryDto, input: UpdateEntryInput): EntryDto {
  return {
    ...entry,
    ...(input.note !== undefined && { note: input.note }),
    ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
    ...(input.isChecked !== undefined && { isChecked: input.isChecked }),
  };
}

export function useUpdateEntry(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: ({ entryId, input }: EntryUpdate) =>
      apiSend('PATCH', `/entries/${entryId}`, input, entrySchema),
    onMutate: ({ entryId, input }) =>
      updateCachedEntries(queryClient, listId, (entries) =>
        entries.map((entry) => (entry.id === entryId ? applyUpdate(entry, input) : entry)),
      ),
    onError: (error, _update, snapshot) => {
      rollbackEntries(queryClient, listId, snapshot);
      toastStore.show(`Couldn't save: ${error.message}`);
    },
    onSettled: () => settleList(queryClient, listId),
  });
}
