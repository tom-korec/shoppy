import type { EntryDto } from '@shoppy/shared';
import { CheckMark } from '@/components/ui/check-mark';
import { cn } from '@/lib/cn';

interface ShoppingEntryRowProps {
  entry: EntryDto;
  onToggle: () => void;
}

// The whole row is the tap target: in the shop, one hand holds the basket.
export function ShoppingEntryRow({ entry, onToggle }: ShoppingEntryRowProps) {
  return (
    <li>
      <label className="relative flex min-h-14 w-full cursor-pointer items-center gap-3 px-3">
        <input
          type="checkbox"
          aria-label={entry.note ? `${entry.name}, ${entry.note}` : entry.name}
          checked={entry.isChecked}
          onChange={onToggle}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
        />
        <CheckMark />
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'text-lg font-medium',
              entry.isChecked && 'text-muted-foreground line-through',
            )}
          >
            {entry.name}
          </span>
          {entry.note && <span className="text-sm text-muted-foreground">{entry.note}</span>}
        </span>
      </label>
    </li>
  );
}
