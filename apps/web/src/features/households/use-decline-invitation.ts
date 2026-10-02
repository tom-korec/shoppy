import { apiCommand } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useDeclineInvitation() {
  return useHouseholdMutation((invitationId: string) =>
    apiCommand('POST', `/invitations/${invitationId}/decline`),
  );
}
