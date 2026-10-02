import { inviteCodeSchema } from '@shoppy/shared';
import { useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { InvitationPreviewCard } from './invitation-preview-card';
import { useAcceptInvitation } from './use-accept-invitation';
import { usePreviewInvitation } from './use-preview-invitation';

interface JoinWithCodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinWithCodeSheet({ isOpen, onClose }: JoinWithCodeSheetProps) {
  const navigate = useNavigate();
  const preview = usePreviewInvitation();
  const accept = useAcceptInvitation();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();

  const lookUp = (event: FormEvent) => {
    event.preventDefault();
    const parsed = inviteCodeSchema.safeParse(code);
    if (!parsed.success) return setCodeError(parsed.error.issues[0]?.message);
    setCodeError(undefined);
    preview.mutate({ code: parsed.data });
  };

  const openHousehold = (householdId: string) => {
    onClose();
    void navigate({ to: '/households/$householdId', params: { householdId } });
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Join with a code">
      {preview.data ? (
        <InvitationPreviewCard
          preview={preview.data}
          isJoining={accept.isPending}
          error={accept.error}
          onJoin={() =>
            accept.mutate(
              { code: inviteCodeSchema.parse(code) },
              { onSuccess: (household) => openHousehold(household.id) },
            )
          }
          onOpen={() => openHousehold(preview.data.householdId)}
        />
      ) : (
        <form onSubmit={lookUp} noValidate className="flex flex-col gap-4">
          {preview.error && <FormAlert tone="error">{preview.error.message}</FormAlert>}
          <TextField
            label="Code"
            hint="8 characters, from the person who invited you"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            error={codeError}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button type="submit" width="full" isLoading={preview.isPending}>
            Continue
          </Button>
        </form>
      )}
    </Sheet>
  );
}
