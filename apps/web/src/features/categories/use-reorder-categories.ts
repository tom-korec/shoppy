import { type CategoryDto, categoryListSchema } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { type ScopeKey, scopeId, scopePath } from '@/features/households/scope-key';
import { categoriesKey } from './use-categories';

export function useReorderCategories(scope: ScopeKey) {
  const queryClient = useQueryClient();
  return useMutation({
    // One reorder at a time: a late answer to an older drag must not win.
    scope: { id: `categories:reorder:${scopeId(scope)}` },
    mutationFn: (ordered: CategoryDto[]) =>
      apiSend(
        'POST',
        `${scopePath(scope)}/categories/reorder`,
        { ids: ordered.map(({ id }) => id) },
        categoryListSchema,
      ),
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey(scope) });
      const previous = queryClient.getQueryData<CategoryDto[]>(categoriesKey(scope));
      queryClient.setQueryData(
        categoriesKey(scope),
        ordered.map((category, position) => ({ ...category, position })),
      );
      return { previous };
    },
    onError: (_error, _ordered, context) => {
      queryClient.setQueryData(categoriesKey(scope), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKey(scope) }),
  });
}
