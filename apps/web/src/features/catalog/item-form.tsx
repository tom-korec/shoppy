import { createItemInputSchema, type ItemDto } from '@shoppy/shared';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';
import { useCategories } from '@/features/categories/use-categories';
import { useSaveItem } from './use-save-item';

// The category select sends '' for "no category".
const itemFormSchema = createItemInputSchema.extend({
  categoryId: z.union([z.literal('').transform(() => null), z.uuid()]),
});

interface ItemFormProps {
  item?: ItemDto;
  initialCategoryId?: string;
  onSaved: () => void;
}

export function ItemForm({ item, initialCategoryId, onSaved }: ItemFormProps) {
  const save = useSaveItem(item);
  const categories = useCategories();
  const form = useZodForm(
    itemFormSchema,
    {
      name: item?.name ?? '',
      description: item?.description ?? '',
      categoryId: item ? (item.categoryId ?? '') : (initialCategoryId ?? ''),
    },
    (input) => save.mutate(input, { onSuccess: onSaved }),
  );

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {save.error && <FormAlert tone="error">{save.error.message}</FormAlert>}
      <TextField label="Name" autoComplete="off" {...form.field('name')} />
      <TextField
        label="Description"
        hint="Optional, e.g. a brand or where to find it"
        autoComplete="off"
        {...form.field('description')}
      />
      <SelectField label="Category" {...form.field('categoryId')}>
        <option value="">No category</option>
        {categories.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </SelectField>
      <Button type="submit" width="full" isLoading={save.isPending}>
        {item ? 'Save' : 'Add item'}
      </Button>
    </form>
  );
}
