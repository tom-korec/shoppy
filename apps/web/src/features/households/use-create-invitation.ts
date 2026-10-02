import { type CreateInvitationInput, createdInvitationSchema } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useCreateInvitation(householdId: string) {
  return useHouseholdMutation((input: CreateInvitationInput) =>
    apiSend('POST', `/households/${householdId}/invitations`, input, createdInvitationSchema),
  );
}
