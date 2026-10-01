import { createFileRoute } from '@tanstack/react-router';
import { signInSearchSchema } from '@/features/auth/auth-search';
import { SignInPage } from '@/features/auth/sign-in-page';

export const Route = createFileRoute('/_guest/sign-in')({
  validateSearch: signInSearchSchema,
  component: SignInPage,
});
