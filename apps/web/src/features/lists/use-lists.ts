import { listListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { LISTS_QUERY_KEY } from './list-query-keys';

// Personal lists and those of the user's households.
export function useLists() {
  return useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: () => apiGet('/lists', listListSchema),
  });
}
