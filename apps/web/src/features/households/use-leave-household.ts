import { apiCommand } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useLeaveHousehold(householdId: string) {
  return useHouseholdMutation(() => apiCommand('POST', `/households/${householdId}/leave`));
}
