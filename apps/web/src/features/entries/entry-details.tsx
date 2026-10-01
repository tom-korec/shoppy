import { type CategoryDto, type EntryDto, ENTRY_NOTE_MAX_LENGTH } from '@shoppy/shared';
import { BookPlus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useDeleteEntry } from './use-delete-entry';
import { usePromoteEntry } from './use-promote-entry';
import { useUpdateEntry } from './use-update-entry';

interface EntryDetailsProps {
  listId: string;
  entry: EntryDto;
  categories: CategoryDto[];
  onClose: () => void;
}

export function EntryDetails({ listId, entry, categories, onClose }: EntryDetailsProps) {
  const [note, setNote] = useState(entry.note ?? '');
  const [categoryId, setCategoryId] = useState(entry.categoryId ?? '');
  const updateEntry = useUpdateEntry(listId);
  const promoteEntry = usePromoteEntry(listId);
  const deleteEntry = useDeleteEntry(listId);
  const isOneTime = entry.itemId === null;
  const categoryName = categories.find(({ id }) => id === entry.categoryId)?.name;

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateEntry.mutate({
      entryId: entry.id,
      input: { note: note.trim() || null, ...(isOneTime && { categoryId: categoryId || null }) },
    });
    onClose();
  };

  // Promoting keeps a note typed but not saved yet. List changes run in order, so the note is
  // saved before the promotion.
  const promote = () => {
    const trimmedNote = note.trim() || null;
    if (trimmedNote !== entry.note) {
      updateEntry.mutate({ entryId: entry.id, input: { note: trimmedNote } });
    }
    promoteEntry.mutate(
      { entryId: entry.id, input: { categoryId: categoryId || null } },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <TextField
        label="Note"
        hint="Quantity or anything else, e.g. 2 l, organic"
        autoComplete="off"
        maxLength={ENTRY_NOTE_MAX_LENGTH}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {isOneTime ? (
        <SelectField
          label="Category"
          hint="One-time entry: not in the catalog."
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
      ) : (
        <p className="text-sm text-muted-foreground">
          From the catalog{categoryName ? ` · ${categoryName}` : ''}. Change its name or category in
          the catalog.
        </p>
      )}
      <Button type="submit" width="full">
        Save
      </Button>
      {isOneTime && (
        <Button
          variant="secondary"
          width="full"
          isLoading={promoteEntry.isPending}
          onClick={promote}
        >
          <BookPlus className="size-4" aria-hidden />
          Add to catalog
        </Button>
      )}
      {promoteEntry.error && <p className="text-sm text-danger">{promoteEntry.error.message}</p>}
      <Button
        variant="danger"
        width="full"
        onClick={() => {
          deleteEntry.mutate(entry);
          onClose();
        }}
      >
        <Trash2 className="size-4" aria-hidden />
        Delete
      </Button>
    </form>
  );
}
