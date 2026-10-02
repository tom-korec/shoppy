import { type CreateListInput, createListInputSchema, DEFAULT_LIST_ICON } from '@shoppy/shared';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { IconPicker } from '@/components/ui/icon-picker';
import { TextField } from '@/components/ui/text-field';
import { useZodForm } from '@/components/ui/use-zod-form';

interface ListFormProps {
  initial?: { name: string; icon: string };
  submitLabel: string;
  isPending: boolean;
  error: Error | null;
  children?: ReactNode;
  onSubmit: (input: CreateListInput) => void;
}

export function ListForm({
  initial,
  submitLabel,
  isPending,
  error,
  children,
  onSubmit,
}: ListFormProps) {
  const form = useZodForm(
    createListInputSchema,
    { name: initial?.name ?? '', icon: initial?.icon ?? DEFAULT_LIST_ICON },
    (input) => onSubmit(input),
  );
  const icon = form.field('icon');

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
      {error && <FormAlert tone="error">{error.message}</FormAlert>}
      <TextField label="Name" autoComplete="off" placeholder="Groceries" {...form.field('name')} />
      {children}
      <IconPicker
        label="Icon"
        value={icon.value}
        onChange={(value) => icon.onChange({ target: { value } })}
      />
      <Button type="submit" width="full" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
