import { pendingInvitationListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const PENDING_INVITATIONS_QUERY_KEY = ['invitations', 'pending'];

export function usePendingInvitations() {
  return useQuery({
    queryKey: PENDING_INVITATIONS_QUERY_KEY,
    queryFn: () => apiGet('/invitations/pending', pendingInvitationListSchema),
  });
}
