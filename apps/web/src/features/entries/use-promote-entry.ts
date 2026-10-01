import { entrySchema, type PromoteEntryInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATALOG_QUERY_KEY } from '@/features/catalog/use-items';
import { CATEGORIES_QUERY_KEY } from '@/features/categories/use-categories';
import { apiSend } from '@/lib/api';
import { listMutationOptions, settleList, updateCachedEntries } from './list-cache';

interface Promotion {
  entryId: string;
  input: PromoteEntryInput;
}

export function usePromoteEntry(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    ...listMutationOptions(listId),
    mutationFn: ({ entryId, input }: Promotion) =>
      apiSend('POST', `/entries/${entryId}/promote`, input, entrySchema),
    onSuccess: (promoted) =>
      updateCachedEntries(queryClient, listId, (entries) =>
        entries.map((entry) => (entry.id === promoted.id ? promoted : entry)),
      ),
    onSettled: () =>
      Promise.all([
        settleList(queryClient, listId),
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
      ]),
  });
}
