import type { CreatedInvitationDto } from '@shoppy/shared';
import { Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyText, shareText } from '@/lib/share-text';

interface InviteResultProps {
  created: CreatedInvitationDto;
  householdName: string;
  onDone: () => void;
}

// The link or code is shown only now: the app keeps no copy of it.
export function InviteResult({ created, householdName, onDone }: InviteResultProps) {
  const secret = created.url ?? created.code;
  const message = created.url
    ? `Join "${householdName}" on Shoppy: ${created.url}`
    : `Join "${householdName}" on Shoppy with the code ${created.code}`;

  return (
    <div className="flex flex-col gap-4">
      {secret ? (
        <>
          <p className="text-muted-foreground">
            Send this to the people you're inviting. It works for 7 days and is shown only now.
          </p>
          <p
            className={
              created.code
                ? 'rounded-2xl bg-muted py-4 text-center font-mono text-3xl tracking-[0.3em]'
                : 'rounded-2xl bg-muted p-3 font-mono text-sm break-all'
            }
          >
            {created.code ? `${created.code.slice(0, 4)}-${created.code.slice(4)}` : created.url}
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => void shareText('Shoppy invitation', message)}>
              <Share2 className="size-4" aria-hidden />
              Share
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => void copyText(secret)}>
              <Copy className="size-4" aria-hidden />
              Copy
            </Button>
          </div>
        </>
      ) : (
        <p>Invitation sent to {created.invitation.email}. It's valid for 7 days.</p>
      )}
      <Button variant="ghost" width="full" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
