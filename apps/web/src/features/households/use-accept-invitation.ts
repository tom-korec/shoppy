import { householdSchema, type InvitationRef } from '@shoppy/shared';
import { apiSend } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useAcceptInvitation() {
  return useHouseholdMutation((ref: InvitationRef) =>
    apiSend('POST', '/invitations/accept', ref, householdSchema),
  );
}
