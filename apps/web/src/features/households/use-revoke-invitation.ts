import { apiCommand } from '@/lib/api';
import { useHouseholdMutation } from './use-household-mutation';

export function useRevokeInvitation() {
  return useHouseholdMutation((invitationId: string) =>
    apiCommand('DELETE', `/invitations/${invitationId}`),
  );
}
