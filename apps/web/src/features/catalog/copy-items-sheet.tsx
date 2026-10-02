import type { CopyItemsInput } from '@shoppy/shared';
import { House, User } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { SheetAction } from '@/components/ui/sheet-action';
import type { ScopeKey } from '@/features/households/scope-key';
import { useHouseholds } from '@/features/households/use-households';

interface CopyItemsSheetProps {
  isOpen: boolean;
  from: ScopeKey;
  onCopy: (target: CopyItemsInput['target']) => void;
  onClose: () => void;
}

// Targets: the personal catalog and households where the user may create items (FR-I5).
export function CopyItemsSheet({ isOpen, from, onCopy, onClose }: CopyItemsSheetProps) {
  const households = useHouseholds();
  const targets = (households.data ?? []).filter(
    (household) =>
      household.myPermissions.includes('item.create') &&
      !(from.kind === 'household' && from.householdId === household.id),
  );

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Copy to">
      <div className="-mx-1 flex flex-col">
        {from.kind === 'household' && (
          <SheetAction icon={User} label="Personal" onClick={() => onCopy({ kind: 'personal' })} />
        )}
        {targets.map((household) => (
          <SheetAction
            key={household.id}
            icon={House}
            label={household.name}
            onClick={() => onCopy({ kind: 'household', householdId: household.id })}
          />
        ))}
        {from.kind === 'personal' && targets.length === 0 && (
          <p className="px-3 py-2 text-muted-foreground">
            Join or create a household to copy items there.
          </p>
        )}
      </div>
    </Sheet>
  );
}
