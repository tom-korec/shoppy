import { createFileRoute, Outlet } from '@tanstack/react-router';
import { redirectSignedInUser } from '@/features/auth/route-guards';

export const Route = createFileRoute('/_guest')({
  beforeLoad: ({ context }) => redirectSignedInUser(context.auth),
  component: Outlet,
});
