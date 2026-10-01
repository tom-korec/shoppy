import {
  type CategoryDto,
  type CreateCategoryInput,
  createCategoryInputSchema,
} from '@shoppy/shared';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { IconPicker } from '@/components/ui/icon-picker';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useSaveCategory } from './use-save-category';

interface CategoryFormProps {
  category?: CategoryDto;
  onSaved: () => void;
}

export function CategoryForm({ category, onSaved }: CategoryFormProps) {
  const save = useSaveCategory(category);
  const form = useZodForm(
    createCategoryInputSchema,
    { name: category?.name ?? '', icon: category?.icon ?? 'shopping-basket' },
    (input: CreateCategoryInput) => save.mutate(input, { onSuccess: onSaved }),
  );
  const icon = form.field('icon');

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {save.error && <FormAlert tone="error">{save.error.message}</FormAlert>}
      <TextField label="Name" autoComplete="off" {...form.field('name')} />
      <IconPicker
        label="Icon"
        value={icon.value}
        onChange={(value) => icon.onChange({ target: { value } })}
      />
      <Button type="submit" width="full" isLoading={save.isPending}>
        {category ? 'Save' : 'Add category'}
      </Button>
    </form>
  );
}
