import { PASSWORD_MIN_LENGTH, passwordSchema } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useEmailLinkToken } from './use-email-link-token';
import { useResetPassword } from './use-reset-password';

const newPasswordFormSchema = z.object({ password: passwordSchema });

export function ResetPasswordPage() {
  const token = useEmailLinkToken();
  const resetPassword = useResetPassword();
  const form = useZodForm(newPasswordFormSchema, { password: '' }, ({ password }) =>
    resetPassword.mutate({ token, password }),
  );

  if (token === '') {
    return (
      <AuthLayout title="Link not valid">
        <FormAlert tone="error">This link is incomplete. Ask for a new one.</FormAlert>
        <Link to="/forgot-password" className="text-center font-medium text-primary">
          Get a new link
        </Link>
      </AuthLayout>
    );
  }

  if (resetPassword.isSuccess) {
    return (
      <AuthLayout title="Password changed">
        <FormAlert tone="success">
          Your new password is set. For safety, you were signed out on all devices.
        </FormAlert>
        <Link to="/sign-in" search={{}} className="text-center font-medium text-primary">
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password">
      <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
        {resetPassword.isError && (
          <FormAlert tone="error">{errorMessage(resetPassword.error)}</FormAlert>
        )}
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters with a lowercase letter, an uppercase letter and a digit.`}
          {...form.field('password')}
        />
        <Button type="submit" width="full" isLoading={resetPassword.isPending}>
          Save password
        </Button>
      </form>
      <Link to="/forgot-password" className="text-center text-sm font-medium text-primary">
        Need a new link?
      </Link>
    </AuthLayout>
  );
}
