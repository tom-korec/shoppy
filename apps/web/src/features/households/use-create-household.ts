import { type HouseholdInput, householdSchema } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useCreateHousehold() {
  return useHouseholdMutation((input: HouseholdInput) =>
    apiSend('POST', '/households', input, householdSchema),
  );
}
