import { recentHistorySchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { recentHistoryKey } from '@/features/lists/list-query-keys';
import { apiGet } from '@/lib/api';

export function useRecentHistory(listId: string, isEnabled = true) {
  return useQuery({
    queryKey: recentHistoryKey(listId),
    queryFn: () => apiGet(`/lists/${listId}/history/recent`, recentHistorySchema),
    enabled: isEnabled,
  });
}
