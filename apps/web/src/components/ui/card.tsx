import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn('flex flex-col gap-4 rounded-2xl border border-border bg-card p-4', className)}
    >
      {children}
    </div>
  );
}
