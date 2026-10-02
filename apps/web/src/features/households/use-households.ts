import { householdListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const HOUSEHOLDS_QUERY_KEY = ['households'];

export function useHouseholds() {
  return useQuery({
    queryKey: HOUSEHOLDS_QUERY_KEY,
    queryFn: () => apiGet('/households', householdListSchema),
  });
}
