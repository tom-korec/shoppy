import type { ListSort, ListViewDto } from '@shoppy/shared';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioList } from '@/components/ui/radio-list';
import { Sheet } from '@/components/ui/sheet';
import { SwitchField } from '@/components/ui/switch-field';
import { useUpdateListView } from './use-update-list-view';

const SORT_OPTIONS: { value: ListSort; label: string }[] = [
  { value: 'ACTIVITY', label: 'Last activity' },
  { value: 'CREATED', label: 'Newest first' },
  { value: 'CUSTOM', label: 'My order' },
];

interface ListViewSheetProps {
  isOpen: boolean;
  view: ListViewDto;
  onArrange: () => void;
  onClose: () => void;
}

// Saved in the account, so the view is the same on every device.
export function ListViewSheet({ isOpen, view, onArrange, onClose }: ListViewSheetProps) {
  const update = useUpdateListView();
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="View">
      <SwitchField
        label="Group by household"
        hint="Personal lists first, then each household."
        isOn={view.isGrouped}
        onChange={(isGrouped) => update.mutate({ isGrouped })}
      />
      <RadioList
        legend="Sort"
        options={SORT_OPTIONS}
        value={view.sort}
        onChange={(sort) => update.mutate({ sort })}
      />
      {view.sort === 'CUSTOM' && (
        <Button variant="secondary" width="full" onClick={onArrange}>
          <ArrowUpDown className="size-4" aria-hidden />
          Arrange lists
        </Button>
      )}
    </Sheet>
  );
}
