import { type CategoryDto, categorySchema, type CreateCategoryInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { CATEGORIES_QUERY_KEY } from './use-categories';

export function useSaveCategory(category: CategoryDto | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      category
        ? apiSend('PATCH', `/categories/${category.id}`, input, categorySchema)
        : apiSend('POST', '/scopes/personal/categories', input, categorySchema),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}
