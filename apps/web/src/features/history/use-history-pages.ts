import { historyPageSchema } from '@shoppy/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { historyKey } from '@/features/lists/list-query-keys';
import { apiGet } from '@/lib/api';

export function useHistoryPages(listId: string) {
  return useInfiniteQuery({
    queryKey: historyKey(listId),
    queryFn: ({ pageParam }) =>
      apiGet(
        `/lists/${listId}/history${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`,
        historyPageSchema,
      ),
    initialPageParam: '',
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}
