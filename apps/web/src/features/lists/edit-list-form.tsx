import type { ListDto } from '@shoppy/shared';
import { ListForm } from './list-form';
import { useSaveList } from './use-save-list';

interface EditListFormProps {
  list: ListDto;
  onSaved: () => void;
}

export function EditListForm({ list, onSaved }: EditListFormProps) {
  const save = useSaveList(list);
  return (
    <ListForm
      initial={{ name: list.name, icon: list.icon }}
      submitLabel="Save"
      isPending={save.isPending}
      error={save.error}
      onSubmit={(input) => save.mutate(input, { onSuccess: onSaved })}
    />
  );
}
