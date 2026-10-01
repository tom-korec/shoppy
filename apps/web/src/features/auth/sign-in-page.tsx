import { type LoginInput, loginInputSchema } from '@shoppy/shared';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { GoogleSignInSection } from './google-sign-in-section';
import { safeRedirectPath } from './route-guards';
import { useSessionMutation } from './use-session-mutation';

const route = getRouteApi('/_guest/sign-in');

export function SignInPage() {
  const navigate = useNavigate();
  const redirectTo = safeRedirectPath(route.useSearch().redirect);
  const signIn = useSessionMutation<LoginInput>('/auth/login');
  const form = useZodForm(loginInputSchema, { email: '', password: '' }, (input) =>
    signIn.mutate(input, { onSuccess: () => void navigate({ to: redirectTo }) }),
  );

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back.">
      <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
        {signIn.isError && <FormAlert tone="error">{errorMessage(signIn.error)}</FormAlert>}
        <TextField label="Email" type="email" autoComplete="email" {...form.field('email')} />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...form.field('password')}
        />
        <Link to="/forgot-password" className="self-end py-1 text-sm font-medium text-primary">
          Forgot password?
        </Link>
        <Button type="submit" width="full" isLoading={signIn.isPending}>
          Sign in
        </Button>
      </form>
      <GoogleSignInSection redirectTo={redirectTo} />
      <p className="text-center text-sm text-muted-foreground">
        New to Shoppy?{' '}
        <Link to="/register" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
