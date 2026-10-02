import { type InvitationRef, invitationPreviewSchema } from '@shoppy/shared';
import { useMutation } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';

// A mutation, because the secret goes in a POST body (it must not end up in logged URLs).
export function usePreviewInvitation() {
  return useMutation({
    mutationFn: (ref: InvitationRef) =>
      apiSend('POST', '/invitations/preview', ref, invitationPreviewSchema),
  });
}
