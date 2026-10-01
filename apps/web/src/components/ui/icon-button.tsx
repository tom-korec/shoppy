import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
}

export function IconButton({
  icon: Icon,
  label,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-muted disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
