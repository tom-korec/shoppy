import type { ReactNode } from 'react';
import { Button } from './button';
import { Sheet } from './sheet';

interface ConfirmSheetProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  isDanger?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export function ConfirmSheet({
  isOpen,
  title,
  confirmLabel,
  isDanger = false,
  isPending = false,
  onConfirm,
  onClose,
  children,
}: ConfirmSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title}>
      {children && <p className="text-muted-foreground">{children}</p>}
      <div className="flex flex-col gap-2">
        <Button
          variant={isDanger ? 'dangerSolid' : 'primary'}
          width="full"
          isLoading={isPending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" width="full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Sheet>
  );
}
