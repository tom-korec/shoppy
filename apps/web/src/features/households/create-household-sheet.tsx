import type { HouseholdDto } from '@shoppy/shared';
import { Sheet } from '@/components/ui/sheet';
import { CreateHouseholdForm } from './create-household-form';

interface CreateHouseholdSheetProps {
  isOpen: boolean;
  onCreated: (household: HouseholdDto) => void;
  onClose: () => void;
}

export function CreateHouseholdSheet({ isOpen, onCreated, onClose }: CreateHouseholdSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="New household">
      <p className="text-muted-foreground">
        Share lists, a catalog and categories with the people you live or shop with.
      </p>
      <CreateHouseholdForm onCreated={onCreated} />
    </Sheet>
  );
}
