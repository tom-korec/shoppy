import type { ReactNode } from 'react';

interface ColumnFlowProps {
  children: ReactNode;
}

// Stacked on mobile; on desktop the sections flow into two balanced columns, keeping their order.
export function ColumnFlow({ children }: ColumnFlowProps) {
  return (
    <div className="flex flex-col gap-6 lg:block lg:columns-2 lg:gap-8 lg:*:mb-8 lg:*:break-inside-avoid">
      {children}
    </div>
  );
}
