import { Navigate } from '@tanstack/react-router';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { errorMessage } from '@/lib/form-errors';
import { useAuth } from './use-auth';
import { useRefreshCurrentUser } from './use-refresh-current-user';
import { useResendVerification } from './use-resend-verification';
import { useSignOut } from './use-sign-out';

export function VerifyPendingPage() {
  const auth = useAuth();
  const currentUser = useRefreshCurrentUser();
  const resend = useResendVerification();
  const signOut = useSignOut();

  if (auth.status === 'signed-out') return <Navigate to="/sign-in" search={{}} />;
  if (auth.status !== 'signed-in') return null;
  if (auth.user.isEmailVerified) return <Navigate to="/" />;

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle={
        <>
          We sent a confirmation link to{' '}
          <strong className="text-foreground">{auth.user.email}</strong>. Open it to start using
          Shoppy.
        </>
      }
    >
      <MailCheck className="size-12 self-center text-primary" aria-hidden />
      {resend.isSuccess && <FormAlert tone="success">A new link is on its way.</FormAlert>}
      {resend.isError && <FormAlert tone="error">{errorMessage(resend.error)}</FormAlert>}
      <div className="flex flex-col gap-3">
        <Button
          width="full"
          isLoading={currentUser.isFetching}
          onClick={() => void currentUser.refetch()}
        >
          I've confirmed it
        </Button>
        <Button
          variant="secondary"
          width="full"
          isLoading={resend.isPending}
          onClick={() => resend.mutate()}
        >
          Send the link again
        </Button>
        <Button variant="ghost" width="full" onClick={() => signOut.mutate()}>
          Use a different account
        </Button>
      </div>
    </AuthLayout>
  );
}
