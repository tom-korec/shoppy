import type { CategoryDto, EntryDto } from '@shoppy/shared';
import { Sheet } from '@/components/ui/sheet';
import { EntryDetails } from './entry-details';

interface EntrySheetProps {
  listId: string;
  entry: EntryDto | undefined;
  categories: CategoryDto[];
  onClose: () => void;
}

export function EntrySheet({ listId, entry, categories, onClose }: EntrySheetProps) {
  return (
    <Sheet isOpen={entry !== undefined} onClose={onClose} title={entry?.name ?? ''}>
      {entry && (
        <EntryDetails listId={listId} entry={entry} categories={categories} onClose={onClose} />
      )}
    </Sheet>
  );
}
