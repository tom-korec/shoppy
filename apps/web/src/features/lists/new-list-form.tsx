import type { ListDto } from '@shoppy/shared';
import { useState } from 'react';
import { SelectField } from '@/components/ui/select-field';
import { scopeFromId } from '@/features/households/scope-key';
import { useHouseholds } from '@/features/households/use-households';
import { ListForm } from './list-form';
import { useCreateList } from './use-create-list';

interface NewListFormProps {
  onCreated: (list: ListDto) => void;
}

// Personal, or a household where the user may create lists.
export function NewListForm({ onCreated }: NewListFormProps) {
  const create = useCreateList();
  const households = useHouseholds();
  const [scopeId, setScopeId] = useState('personal');
  const targets = (households.data ?? []).filter(({ myPermissions }) =>
    myPermissions.includes('list.create'),
  );

  return (
    <ListForm
      submitLabel="Create list"
      isPending={create.isPending}
      error={create.error}
      onSubmit={(input) =>
        create.mutate({ scope: scopeFromId(scopeId), input }, { onSuccess: onCreated })
      }
    >
      {targets.length > 0 && (
        <SelectField
          label="For"
          value={scopeId}
          onChange={(event) => setScopeId(event.target.value)}
        >
          <option value="personal">Just me (personal)</option>
          {targets.map((household) => (
            <option key={household.id} value={household.id}>
              {household.name}
            </option>
          ))}
        </SelectField>
      )}
    </ListForm>
  );
}
