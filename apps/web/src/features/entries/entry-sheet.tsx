import type { CategoryDto, EntryDto } from '@shoppy/shared';
import { Sheet } from '@/components/ui/sheet';
import { EntryDetails } from './entry-details';
import type { ListAbilities } from './list-abilities';

interface EntrySheetProps {
  listId: string;
  entry: EntryDto | undefined;
  categories: CategoryDto[];
  abilities: ListAbilities;
  onClose: () => void;
}

export function EntrySheet({ listId, entry, categories, abilities, onClose }: EntrySheetProps) {
  return (
    <Sheet isOpen={entry !== undefined} onClose={onClose} title={entry?.name ?? ''}>
      {entry && (
        <EntryDetails
          listId={listId}
          entry={entry}
          categories={categories}
          abilities={abilities}
          onClose={onClose}
        />
      )}
    </Sheet>
  );
}
