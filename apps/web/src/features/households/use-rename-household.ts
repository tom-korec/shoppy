import { type HouseholdInput, householdSchema } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useRenameHousehold(householdId: string) {
  return useHouseholdMutation((input: HouseholdInput) =>
    apiSend('PATCH', `/households/${householdId}`, input, householdSchema),
  );
}
