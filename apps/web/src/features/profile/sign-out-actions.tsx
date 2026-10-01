import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { useSignOut } from '@/features/auth/use-sign-out';
import { errorMessage } from '@/lib/form-errors';
import { useSignOutEverywhere } from './use-sign-out-everywhere';

export function SignOutActions() {
  const signOut = useSignOut();
  const signOutEverywhere = useSignOutEverywhere();

  const confirmSignOutEverywhere = () => {
    if (window.confirm('Sign out on all devices, including this one?')) signOutEverywhere.mutate();
  };

  return (
    <div className="flex flex-col gap-3">
      {signOutEverywhere.isError && (
        <FormAlert tone="error">{errorMessage(signOutEverywhere.error)}</FormAlert>
      )}
      <Button
        variant="danger"
        width="full"
        isLoading={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        Sign out
      </Button>
      <Button
        variant="ghost"
        width="full"
        className="text-muted-foreground"
        isLoading={signOutEverywhere.isPending}
        onClick={confirmSignOutEverywhere}
      >
        Sign out on all devices
      </Button>
    </div>
  );
}
