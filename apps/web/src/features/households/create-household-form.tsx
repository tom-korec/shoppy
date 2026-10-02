import { type HouseholdDto, householdInputSchema } from '@shoppy/shared';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useCreateHousehold } from './use-create-household';

interface CreateHouseholdFormProps {
  onCreated: (household: HouseholdDto) => void;
}

export function CreateHouseholdForm({ onCreated }: CreateHouseholdFormProps) {
  const create = useCreateHousehold();
  const form = useZodForm(householdInputSchema, { name: '' }, (input) =>
    create.mutate(input, { onSuccess: onCreated }),
  );
  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {create.error && <FormAlert tone="error">{create.error.message}</FormAlert>}
      <TextField label="Name" placeholder="Home" autoComplete="off" {...form.field('name')} />
      <Button type="submit" width="full" isLoading={create.isPending}>
        Create household
      </Button>
    </form>
  );
}
