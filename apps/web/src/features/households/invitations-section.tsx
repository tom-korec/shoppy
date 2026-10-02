import type { CreatedInvitationDto, HouseholdDto } from '@shoppy/shared';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Sheet } from '@/components/ui/sheet';
import { InvitationRow } from './invitation-row';
import { InviteForm } from './invite-form';
import { InviteResult } from './invite-result';
import { useInvitations } from './use-invitations';
import { useRevokeInvitation } from './use-revoke-invitation';

interface InvitationsSectionProps {
  household: HouseholdDto;
}

export function InvitationsSection({ household }: InvitationsSectionProps) {
  const invitations = useInvitations(household.id, true);
  const revoke = useRevokeInvitation();
  const [isInviting, setIsInviting] = useState(false);
  const [created, setCreated] = useState<CreatedInvitationDto>();

  const close = () => {
    setIsInviting(false);
    setCreated(undefined);
  };

  return (
    <Section title="Invitations">
      {invitations.data && invitations.data.length > 0 && (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {invitations.data.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              onRevoke={() => revoke.mutate(invitation.id)}
            />
          ))}
        </ul>
      )}
      <Button variant="secondary" width="full" onClick={() => setIsInviting(true)}>
        <UserPlus className="size-4" aria-hidden />
        Invite someone
      </Button>
      <Sheet isOpen={isInviting} onClose={close} title={`Invite to ${household.name}`}>
        {created ? (
          <InviteResult created={created} householdName={household.name} onDone={close} />
        ) : (
          <InviteForm householdId={household.id} myRole={household.myRole} onCreated={setCreated} />
        )}
      </Sheet>
    </Section>
  );
}
