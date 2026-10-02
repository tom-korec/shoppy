import { householdSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { HOUSEHOLDS_QUERY_KEY } from './use-households';

export const householdKey = (householdId: string) => [...HOUSEHOLDS_QUERY_KEY, householdId];

export function useHousehold(householdId: string) {
  return useQuery({
    queryKey: householdKey(householdId),
    queryFn: () => apiGet(`/households/${householdId}`, householdSchema),
  });
}
