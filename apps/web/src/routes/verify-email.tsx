import { createFileRoute } from '@tanstack/react-router';
import { emailLinkSearchSchema } from '@/features/auth/auth-search';
import { VerifyEmailPage } from '@/features/auth/verify-email-page';

export const Route = createFileRoute('/verify-email')({
  validateSearch: emailLinkSearchSchema,
  component: VerifyEmailPage,
});
