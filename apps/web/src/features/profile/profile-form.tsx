import { updateMeInputSchema } from '@shoppy/shared';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { errorMessage } from '@/lib/form-errors';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useUpdateProfile } from './use-update-profile';

export function ProfileForm() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const form = useZodForm(updateMeInputSchema, { displayName: user.displayName }, (input) =>
    updateProfile.mutate(input),
  );
  const isUnchanged = form.values.displayName.trim() === user.displayName;

  return (
    <form noValidate onSubmit={form.handleSubmit} className="flex flex-col gap-4">
      {updateProfile.isError && (
        <FormAlert tone="error">{errorMessage(updateProfile.error)}</FormAlert>
      )}
      <TextField label="Name" autoComplete="name" {...form.field('displayName')} />
      <TextField label="Email" type="email" value={user.email} readOnly disabled />
      <Button
        type="submit"
        variant="secondary"
        className="self-start"
        disabled={isUnchanged}
        isLoading={updateProfile.isPending}
      >
        Save name
      </Button>
    </form>
  );
}
