import { itemListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { type ScopeKey, scopeId, scopePath } from '@/features/households/scope-key';
import { apiGet } from '@/lib/api';

export const CATALOG_QUERY_KEY_ROOT = ['catalog'];
export const catalogKey = (scope: ScopeKey) => [...CATALOG_QUERY_KEY_ROOT, scopeId(scope)];

// The whole catalog is loaded once and searched on the device (search, filters, quick add).
export function useItems(scope: ScopeKey) {
  return useQuery({
    queryKey: catalogKey(scope),
    queryFn: () => apiGet(`${scopePath(scope)}/items`, itemListSchema),
  });
}
