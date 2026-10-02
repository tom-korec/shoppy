import type { InvitationPreviewDto } from '@shoppy/shared';
import { House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { ROLE_LABELS } from './role-labels';

interface InvitationPreviewCardProps {
  preview: InvitationPreviewDto;
  isJoining: boolean;
  error: Error | null;
  onJoin: () => void;
  onOpen: () => void;
}

export function InvitationPreviewCard({
  preview,
  isJoining,
  error,
  onJoin,
  onOpen,
}: InvitationPreviewCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <House className="size-5" aria-hidden />
        </span>
        <p>
          {preview.invitedBy ?? 'Someone'} invited you to <strong>{preview.householdName}</strong>{' '}
          as {ROLE_LABELS[preview.role].toLowerCase()}.
        </p>
      </div>
      {error && <FormAlert tone="error">{error.message}</FormAlert>}
      {preview.isAlreadyMember ? (
        <>
          <p className="text-muted-foreground">You're already in {preview.householdName}.</p>
          <Button width="full" onClick={onOpen}>
            Open {preview.householdName}
          </Button>
        </>
      ) : (
        <Button width="full" isLoading={isJoining} onClick={onJoin}>
          Join {preview.householdName}
        </Button>
      )}
    </div>
  );
}
