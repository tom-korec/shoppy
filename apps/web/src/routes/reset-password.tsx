import { createFileRoute } from '@tanstack/react-router';
import { emailLinkSearchSchema } from '@/features/auth/auth-search';
import { ResetPasswordPage } from '@/features/auth/reset-password-page';

export const Route = createFileRoute('/reset-password')({
  validateSearch: emailLinkSearchSchema,
  component: ResetPasswordPage,
});
