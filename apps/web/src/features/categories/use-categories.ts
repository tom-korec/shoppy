import { categoryListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const CATEGORIES_QUERY_KEY = ['categories', 'personal'];

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => apiGet('/scopes/personal/categories', categoryListSchema),
  });
}
