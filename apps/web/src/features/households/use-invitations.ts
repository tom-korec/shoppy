import { invitationListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { householdKey } from './use-household';

export const invitationsKey = (householdId: string) => [
  ...householdKey(householdId),
  'invitations',
];

export function useInvitations(householdId: string, isEnabled: boolean) {
  return useQuery({
    queryKey: invitationsKey(householdId),
    queryFn: () => apiGet(`/households/${householdId}/invitations`, invitationListSchema),
    enabled: isEnabled,
  });
}
