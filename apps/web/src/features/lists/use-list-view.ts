import { listViewSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LIST_VIEW_QUERY_KEY } from './list-query-keys';

export function useListView() {
  return useQuery({
    queryKey: LIST_VIEW_QUERY_KEY,
    queryFn: () => apiGet('/me/list-view', listViewSchema),
  });
}
