import { createListInputSchema, DEFAULT_LIST_ICON, type ListDto } from '@shoppy/shared';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { IconPicker } from '@/components/ui/icon-picker';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useSaveList } from './use-save-list';

interface ListFormProps {
  list?: ListDto;
  onSaved: (list: ListDto) => void;
}

export function ListForm({ list, onSaved }: ListFormProps) {
  const save = useSaveList(list);
  const form = useZodForm(
    createListInputSchema,
    { name: list?.name ?? '', icon: list?.icon ?? DEFAULT_LIST_ICON },
    (input) => save.mutate(input, { onSuccess: onSaved }),
  );
  const icon = form.field('icon');

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {save.error && <FormAlert tone="error">{save.error.message}</FormAlert>}
      <TextField label="Name" autoComplete="off" placeholder="Groceries" {...form.field('name')} />
      <IconPicker
        label="Icon"
        value={icon.value}
        onChange={(value) => icon.onChange({ target: { value } })}
      />
      <Button type="submit" width="full" isLoading={save.isPending}>
        {list ? 'Save' : 'Create list'}
      </Button>
    </form>
  );
}
