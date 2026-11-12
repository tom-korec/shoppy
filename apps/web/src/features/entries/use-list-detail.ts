import { listDetailSchema } from '@shoppy/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { listDetailKey } from '@/features/lists/list-query-keys';
import { apiGet } from '@/lib/api';

export const listDetailQueryOptions = (listId: string) =>
  queryOptions({
    queryKey: listDetailKey(listId),
    queryFn: () => apiGet(`/lists/${listId}`, listDetailSchema),
  });

export function useListDetail(listId: string) {
  return useQuery(listDetailQueryOptions(listId));
}
