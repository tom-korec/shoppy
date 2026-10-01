import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function SearchField({ label, ...props }: SearchFieldProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        aria-label={label}
        className="min-h-11 w-full rounded-xl border border-border bg-card pr-3 pl-10 text-base outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        {...props}
      />
    </div>
  );
}
