import { createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { requireVerifiedUser } from '@/features/auth/route-guards';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => requireVerifiedUser(context.auth, location.href),
  component: AppLayout,
});
