import type { GoogleSignInInput } from '@shoppy/shared';
import { useNavigate } from '@tanstack/react-router';
import { FormAlert } from '@/components/ui/form-alert';
import { errorMessage } from '@/lib/form-errors';
import { useGoogleIdentity } from './use-google-identity';
import { useSessionMutation } from './use-session-mutation';

interface GoogleSignInButtonProps {
  clientId: string;
  redirectTo: string;
}

export function GoogleSignInButton({ clientId, redirectTo }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const signIn = useSessionMutation<GoogleSignInInput>('/auth/google');
  const { buttonRef, hasFailed } = useGoogleIdentity(clientId, (idToken) => {
    signIn.mutate({ idToken }, { onSuccess: () => void navigate({ to: redirectTo }) });
  });

  return (
    <div className="flex flex-col gap-3">
      <div ref={buttonRef} className="flex min-h-11 justify-center" aria-busy={signIn.isPending} />
      {hasFailed && <FormAlert tone="error">Google sign-in could not load.</FormAlert>}
      {signIn.isError && <FormAlert tone="error">{errorMessage(signIn.error)}</FormAlert>}
    </div>
  );
}
