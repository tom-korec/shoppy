import { type CategoryDto, categorySchema, type CreateCategoryInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ScopeKey, scopePath } from '@/features/households/scope-key';
import { apiSend } from '@/lib/api';
import { CATEGORIES_QUERY_KEY_ROOT } from './use-categories';

export function useSaveCategory(scope: ScopeKey, category: CategoryDto | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      category
        ? apiSend('PATCH', `/categories/${category.id}`, input, categorySchema)
        : apiSend('POST', `${scopePath(scope)}/categories`, input, categorySchema),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY_ROOT }),
  });
}
