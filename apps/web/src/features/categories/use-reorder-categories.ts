import { type CategoryDto, categoryListSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { CATEGORIES_QUERY_KEY } from './use-categories';

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    // One reorder at a time: a late answer to an older drag must not win.
    scope: { id: 'categories:reorder' },
    mutationFn: (ordered: CategoryDto[]) =>
      apiSend(
        'POST',
        '/scopes/personal/categories/reorder',
        { ids: ordered.map(({ id }) => id) },
        categoryListSchema,
      ),
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      const previous = queryClient.getQueryData<CategoryDto[]>(CATEGORIES_QUERY_KEY);
      queryClient.setQueryData(
        CATEGORIES_QUERY_KEY,
        ordered.map((category, position) => ({ ...category, position })),
      );
      return { previous };
    },
    onError: (_error, _ordered, context) => {
      queryClient.setQueryData(CATEGORIES_QUERY_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}
