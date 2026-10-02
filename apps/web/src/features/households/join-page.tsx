import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';
import { FormAlert } from '@/components/ui/form-alert';
import { Page } from '@/components/ui/page';
import { InvitationPreviewCard } from './invitation-preview-card';
import { useAcceptInvitation } from './use-accept-invitation';
import { usePreviewInvitation } from './use-preview-invitation';

const route = getRouteApi('/_authenticated/join/$token');

// The deep link from a shared or emailed invitation (FR-H3). Signed-out users sign in first
// and come back here.
export function JoinPage() {
  const { token } = route.useParams();
  const navigate = useNavigate();
  const preview = usePreviewInvitation();
  const accept = useAcceptInvitation();
  const { mutate: lookUp } = preview;

  useEffect(() => {
    lookUp({ token });
  }, [lookUp, token]);

  const openHousehold = (householdId: string) =>
    void navigate({ to: '/households/$householdId', params: { householdId } });

  return (
    <Page title="Invitation">
      {preview.error && (
        <div className="flex flex-col gap-3">
          <FormAlert tone="error">{preview.error.message}</FormAlert>
          <p className="text-muted-foreground">
            Ask for a new invitation, or{' '}
            <Link to="/profile" className="font-medium text-primary">
              join with a code
            </Link>
            .
          </p>
        </div>
      )}
      {preview.data ? (
        <InvitationPreviewCard
          preview={preview.data}
          isJoining={accept.isPending}
          error={accept.error}
          onJoin={() => accept.mutate({ token }, { onSuccess: ({ id }) => openHousehold(id) })}
          onOpen={() => openHousehold(preview.data.householdId)}
        />
      ) : (
        !preview.error && (
          <div className="flex justify-center py-8" aria-label="Loading">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
          </div>
        )
      )}
    </Page>
  );
}
