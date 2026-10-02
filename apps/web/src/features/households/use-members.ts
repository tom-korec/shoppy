import { memberListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { householdKey } from './use-household';

export const membersKey = (householdId: string) => [...householdKey(householdId), 'members'];

export function useMembers(householdId: string) {
  return useQuery({
    queryKey: membersKey(householdId),
    queryFn: () => apiGet(`/households/${householdId}/members`, memberListSchema),
  });
}
