import { createFileRoute } from '@tanstack/react-router';
import { signInSearchSchema } from '@/features/auth/auth-search';
import { requireUnverifiedUser } from '@/features/auth/route-guards';
import { VerifyPendingPage } from '@/features/auth/verify-pending-page';

export const Route = createFileRoute('/verify-pending')({
  validateSearch: signInSearchSchema,
  beforeLoad: ({ context }) => requireUnverifiedUser(context.auth),
  component: VerifyPendingPage,
});
