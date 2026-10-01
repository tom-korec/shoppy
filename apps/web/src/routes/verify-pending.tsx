import { createFileRoute } from '@tanstack/react-router';
import { requireUnverifiedUser } from '@/features/auth/route-guards';
import { VerifyPendingPage } from '@/features/auth/verify-pending-page';

export const Route = createFileRoute('/verify-pending')({
  beforeLoad: ({ context }) => requireUnverifiedUser(context.auth),
  component: VerifyPendingPage,
});
