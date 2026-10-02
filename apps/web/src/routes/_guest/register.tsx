import { createFileRoute } from '@tanstack/react-router';
import { signInSearchSchema } from '@/features/auth/auth-search';
import { RegisterPage } from '@/features/auth/register-page';

export const Route = createFileRoute('/_guest/register')({
  validateSearch: signInSearchSchema,
  component: RegisterPage,
});
