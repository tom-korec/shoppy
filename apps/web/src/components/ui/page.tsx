import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageProps {
  title: string;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Page({ title, leading, actions, className, children }: PageProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-lg flex-col gap-6 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-6',
        className,
      )}
    >
      <header className="flex min-h-11 items-center gap-2">
        {leading}
        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold tracking-tight">{title}</h1>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
