import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LISTS_QUERY_KEY_ROOT } from '@/features/lists/list-query-keys';
import { HOUSEHOLDS_QUERY_KEY } from './use-households';
import { PENDING_INVITATIONS_QUERY_KEY } from './use-pending-invitations';

// Household changes affect the households list, members, invitations and which lists are
// visible, so everything household-related refreshes afterwards.
export function useHouseholdMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PENDING_INVITATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LISTS_QUERY_KEY_ROOT }),
      ]),
  });
}
