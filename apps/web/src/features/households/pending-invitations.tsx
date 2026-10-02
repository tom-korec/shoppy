import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from './role-labels';
import { useAcceptInvitation } from './use-accept-invitation';
import { useDeclineInvitation } from './use-decline-invitation';
import { usePendingInvitations } from './use-pending-invitations';

// Email invitations waiting for an answer (FR-H3). Renders nothing when there are none.
export function PendingInvitations() {
  const pending = usePendingInvitations();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();
  if (!pending.data?.length) return null;

  return (
    <ul className="flex flex-col gap-2" aria-label="Invitations">
      {pending.data.map((invitation) => (
        <li
          key={invitation.invitationId}
          className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4"
        >
          <p className="flex items-start gap-2">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <span>
              {invitation.invitedBy ?? 'Someone'} invited you to{' '}
              <strong>{invitation.householdName}</strong> as{' '}
              {ROLE_LABELS[invitation.role].toLowerCase()}.
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              isLoading={
                accept.isPending &&
                'invitationId' in accept.variables &&
                accept.variables.invitationId === invitation.invitationId
              }
              onClick={() => accept.mutate({ invitationId: invitation.invitationId })}
            >
              Join
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => decline.mutate(invitation.invitationId)}
            >
              Decline
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
