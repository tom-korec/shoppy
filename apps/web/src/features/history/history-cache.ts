import type { HistoryPageDto, RecentHistoryDto } from '@shoppy/shared';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { historyKey, recentHistoryKey } from '@/features/lists/list-query-keys';

export interface HistorySnapshot {
  recent: RecentHistoryDto | undefined;
  pages: InfiniteData<HistoryPageDto> | undefined;
}

// Optimistically drops records from both the recent section and the History screen.
export async function removeCachedRecords(
  queryClient: QueryClient,
  listId: string,
  recordIds: string[],
): Promise<HistorySnapshot> {
  const ids = new Set(recordIds);
  await Promise.all([
    queryClient.cancelQueries({ queryKey: recentHistoryKey(listId) }),
    queryClient.cancelQueries({ queryKey: historyKey(listId) }),
  ]);
  const recent = queryClient.getQueryData<RecentHistoryDto>(recentHistoryKey(listId));
  const pages = queryClient.getQueryData<InfiniteData<HistoryPageDto>>(historyKey(listId));

  if (recent) {
    queryClient.setQueryData<RecentHistoryDto>(recentHistoryKey(listId), {
      ...recent,
      records: recent.records.filter(({ id }) => !ids.has(id)),
    });
  }
  if (pages) {
    queryClient.setQueryData<InfiniteData<HistoryPageDto>>(historyKey(listId), {
      ...pages,
      pages: pages.pages.map((page) => ({
        ...page,
        records: page.records.filter(({ id }) => !ids.has(id)),
      })),
    });
  }
  return { recent, pages };
}

export function rollbackRecords(
  queryClient: QueryClient,
  listId: string,
  snapshot: HistorySnapshot | undefined,
): void {
  if (snapshot?.recent) queryClient.setQueryData(recentHistoryKey(listId), snapshot.recent);
  if (snapshot?.pages) queryClient.setQueryData(historyKey(listId), snapshot.pages);
}
