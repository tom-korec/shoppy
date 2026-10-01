import { Link } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { FormAlert } from '@/components/ui/form-alert';
import { errorMessage } from '@/lib/form-errors';
import { useEmailLinkToken } from './use-email-link-token';
import { useVerifyEmail } from './use-verify-email';

export function VerifyEmailPage() {
  const token = useEmailLinkToken();
  const verification = useVerifyEmail(token);

  if (verification.isSuccess) {
    return (
      <AuthLayout title="Email confirmed">
        <FormAlert tone="success">
          Thanks! If you installed Shoppy on your home screen, you can go back to the app now.
        </FormAlert>
        <Link to="/" className="text-center font-medium text-primary">
          Open Shoppy
        </Link>
      </AuthLayout>
    );
  }

  if (verification.isError || token === '') {
    return (
      <AuthLayout title="Link not valid">
        <FormAlert tone="error">
          {token === '' ? 'This link is incomplete.' : errorMessage(verification.error)} Sign in to
          get a new confirmation email.
        </FormAlert>
        <Link to="/" className="text-center font-medium text-primary">
          Open Shoppy
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Confirming your email…">
      <LoaderCircle className="size-8 animate-spin self-center text-primary" aria-label="Loading" />
    </AuthLayout>
  );
}
