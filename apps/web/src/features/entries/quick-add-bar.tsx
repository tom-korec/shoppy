import type { CategoryDto, ItemDto, PurchaseRecordDto } from '@shoppy/shared';
import { buildNewEntry } from './new-entry';
import { QuickAddForm } from './quick-add-form';
import { useAddEntry } from './use-add-entry';

interface QuickAddBarProps {
  listId: string;
  items: ItemDto[];
  categories: CategoryDto[];
  recentRecords: PurchaseRecordDto[];
}

// Sticky above the bottom navigation, within thumb reach.
export function QuickAddBar({ listId, items, categories, recentRecords }: QuickAddBarProps) {
  const addEntry = useAddEntry(listId);
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-background/95 px-4 py-2 backdrop-blur">
      <div className="mx-auto max-w-lg">
        <QuickAddForm
          items={items}
          categories={categories}
          recentRecords={recentRecords}
          placement="above"
          onAdd={(draft) => addEntry.mutate(buildNewEntry(listId, draft))}
        />
      </div>
    </div>
  );
}
