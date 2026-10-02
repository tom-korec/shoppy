import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DockedBarProps {
  className?: string;
  children: ReactNode;
}

// Pinned above the bottom navigation, within thumb reach; on desktop the navigation moves to the
// side, so the bar drops to the bottom edge next to it.
export function DockedBar({ className, children }: DockedBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border px-4 py-2 backdrop-blur lg:bottom-0 lg:left-60 lg:py-3',
        className,
      )}
    >
      <div className="mx-auto max-w-lg lg:max-w-2xl">{children}</div>
    </div>
  );
}
