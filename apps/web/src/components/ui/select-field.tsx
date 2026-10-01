import { type SelectHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/cn';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function SelectField({ label, hint, className, children, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(
          'min-h-11 rounded-xl border border-border bg-card px-3 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:bg-muted disabled:text-muted-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
