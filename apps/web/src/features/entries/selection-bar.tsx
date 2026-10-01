import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectionBarProps {
  count: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SelectionBar({
  count,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDelete,
  onCancel,
}: SelectionBarProps) {
  const isEmpty = count === 0;
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-card/95 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" aria-live="polite">
            {count} selected
          </p>
          <Button variant="ghost" onClick={onCancel}>
            Done
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" disabled={isEmpty} onClick={onPrimary}>
            <CheckCheck className="size-4" aria-hidden />
            {primaryLabel}
          </Button>
          {secondaryLabel && onSecondary && (
            <Button variant="secondary" className="flex-1" disabled={isEmpty} onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button
            variant="danger"
            disabled={isEmpty}
            onClick={onDelete}
            aria-label="Delete selected"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
