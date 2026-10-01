import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { useRequestPasswordReset } from '@/features/auth/use-request-password-reset';
import { errorMessage } from '@/lib/form-errors';

// Google-only accounts set their first password through the emailed reset link.
export function SetPasswordCard() {
  const user = useCurrentUser();
  const requestLink = useRequestPasswordReset();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        You sign in with Google. Add a password to also sign in with your email.
      </p>
      {requestLink.isSuccess && (
        <FormAlert tone="success">
          We emailed a link to {user.email}. It works for 1 hour.
        </FormAlert>
      )}
      {requestLink.isError && <FormAlert tone="error">{errorMessage(requestLink.error)}</FormAlert>}
      <Button
        variant="secondary"
        className="self-start"
        isLoading={requestLink.isPending}
        onClick={() => requestLink.mutate({ email: user.email })}
      >
        Email me a link
      </Button>
    </div>
  );
}
