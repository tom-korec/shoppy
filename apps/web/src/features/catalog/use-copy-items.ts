import { type CopyItemsInput, copyItemsResultSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATEGORIES_QUERY_KEY_ROOT } from '@/features/categories/use-categories';
import { apiSend } from '@/lib/api';
import { toastStore } from '@/lib/toast-store';
import { CATALOG_QUERY_KEY_ROOT } from './use-items';

export function useCopyItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CopyItemsInput) =>
      apiSend('POST', '/items/copy', input, copyItemsResultSchema),
    onSuccess: ({ copied, skipped }) => {
      const already = skipped.length > 0 ? ` · ${skipped.length} already there` : '';
      toastStore.show(`Copied ${copied} ${copied === 1 ? 'item' : 'items'}${already}`);
    },
    onError: (error) => toastStore.show(error.message),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY_ROOT }),
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY_ROOT }),
      ]),
  });
}
