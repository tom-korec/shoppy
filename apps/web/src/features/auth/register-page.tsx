import { PASSWORD_MIN_LENGTH, type RegisterInput, registerInputSchema } from '@shoppy/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { GoogleSignInSection } from './google-sign-in-section';
import { useSessionMutation } from './use-session-mutation';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useSessionMutation<RegisterInput>('/auth/register');
  const form = useZodForm(
    registerInputSchema,
    { displayName: '', email: '', password: '' },
    (input) =>
      register.mutate(input, { onSuccess: () => void navigate({ to: '/verify-pending' }) }),
  );

  return (
    <AuthLayout title="Create an account" subtitle="Lists for you and your household.">
      <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
        {register.isError && <FormAlert tone="error">{errorMessage(register.error)}</FormAlert>}
        <TextField
          label="Name"
          autoComplete="name"
          hint="Household members see this name."
          {...form.field('displayName')}
        />
        <TextField label="Email" type="email" autoComplete="email" {...form.field('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters with a lowercase letter, an uppercase letter and a digit.`}
          {...form.field('password')}
        />
        <Button type="submit" width="full" isLoading={register.isPending}>
          Create account
        </Button>
      </form>
      <GoogleSignInSection redirectTo="/" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/sign-in" search={{}} className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
