import { apiCommand } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useDeleteHousehold(householdId: string) {
  return useHouseholdMutation(() => apiCommand('DELETE', `/households/${householdId}`));
}
