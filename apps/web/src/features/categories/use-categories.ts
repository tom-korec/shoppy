import { categoryListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { type ScopeKey, scopeId, scopePath } from '@/features/households/scope-key';
import { apiGet } from '@/lib/api';

export const CATEGORIES_QUERY_KEY_ROOT = ['categories'];
export const categoriesKey = (scope: ScopeKey) => [...CATEGORIES_QUERY_KEY_ROOT, scopeId(scope)];

export function useCategories(scope: ScopeKey) {
  return useQuery({
    queryKey: categoriesKey(scope),
    queryFn: () => apiGet(`${scopePath(scope)}/categories`, categoryListSchema),
  });
}
