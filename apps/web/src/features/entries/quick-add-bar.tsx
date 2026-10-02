import type { CategoryDto, ItemDto, PurchaseRecordDto } from '@shoppy/shared';
import { DockedBar } from '@/components/ui/docked-bar';
import { buildNewEntry } from './new-entry';
import { QuickAddForm } from './quick-add-form';
import { useAddEntry } from './use-add-entry';

interface QuickAddBarProps {
  listId: string;
  items: ItemDto[];
  categories: CategoryDto[];
  recentRecords: PurchaseRecordDto[];
}

export function QuickAddBar({ listId, items, categories, recentRecords }: QuickAddBarProps) {
  const addEntry = useAddEntry(listId);
  return (
    <DockedBar className="bg-background/95">
      <QuickAddForm
        items={items}
        categories={categories}
        recentRecords={recentRecords}
        placement="above"
        onAdd={(draft) => addEntry.mutate(buildNewEntry(listId, draft))}
      />
    </DockedBar>
  );
}
