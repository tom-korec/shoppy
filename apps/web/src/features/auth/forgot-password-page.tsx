import { forgotPasswordInputSchema } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useRequestPasswordReset } from './use-request-password-reset';

export function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();
  const form = useZodForm(forgotPasswordInputSchema, { email: '' }, (input) =>
    requestReset.mutate(input),
  );

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a link to set a new one.">
      {requestReset.isSuccess ? (
        <FormAlert tone="success">
          If an account exists for {form.values.email}, the link is on its way. It works for 1 hour.
        </FormAlert>
      ) : (
        <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
          {requestReset.isError && (
            <FormAlert tone="error">{errorMessage(requestReset.error)}</FormAlert>
          )}
          <TextField label="Email" type="email" autoComplete="email" {...form.field('email')} />
          <Button type="submit" width="full" isLoading={requestReset.isPending}>
            Send link
          </Button>
        </form>
      )}
      <Link to="/sign-in" search={{}} className="text-center text-sm font-medium text-primary">
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
