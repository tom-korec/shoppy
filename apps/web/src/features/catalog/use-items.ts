import { itemListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const CATALOG_QUERY_KEY = ['catalog', 'personal'];

// The whole catalog is loaded once and searched on the device (search, filters, quick add).
export function useItems() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: () => apiGet('/scopes/personal/items', itemListSchema),
  });
}
