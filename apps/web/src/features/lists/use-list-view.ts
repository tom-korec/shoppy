import { listViewSchema } from '@shoppy/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LIST_VIEW_QUERY_KEY } from './list-query-keys';

export const listViewQueryOptions = () =>
  queryOptions({
    queryKey: LIST_VIEW_QUERY_KEY,
    queryFn: () => apiGet('/me/list-view', listViewSchema),
  });

export function useListView() {
  return useQuery(listViewQueryOptions());
}
