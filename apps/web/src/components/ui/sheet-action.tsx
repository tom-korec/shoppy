import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SheetActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}

export function SheetAction({ icon: Icon, label, onClick, isDanger = false }: SheetActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-medium hover:bg-muted',
        isDanger && 'text-danger',
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </button>
  );
}
