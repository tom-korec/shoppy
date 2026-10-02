import { householdSchema } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useTransferOwnership(householdId: string) {
  return useHouseholdMutation((memberId: string) =>
    apiSend('POST', `/households/${householdId}/transfer`, { memberId }, householdSchema),
  );
}
