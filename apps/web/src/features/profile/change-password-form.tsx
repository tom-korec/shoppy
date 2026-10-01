import { changePasswordInputSchema, PASSWORD_MIN_LENGTH } from '@shoppy/shared';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useChangePassword } from './use-change-password';

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const form = useZodForm(
    changePasswordInputSchema,
    { currentPassword: '', newPassword: '' },
    (input, { reset }) => changePassword.mutate(input, { onSuccess: reset }),
  );

  return (
    <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
      {changePassword.isError && (
        <FormAlert tone="error">{errorMessage(changePassword.error)}</FormAlert>
      )}
      {changePassword.isSuccess && (
        <FormAlert tone="success">Password changed. Your other devices were signed out.</FormAlert>
      )}
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        {...form.field('currentPassword')}
      />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters with a lowercase letter, an uppercase letter and a digit.`}
        {...form.field('newPassword')}
      />
      <Button
        type="submit"
        variant="secondary"
        className="self-start"
        isLoading={changePassword.isPending}
      >
        Change password
      </Button>
    </form>
  );
}
