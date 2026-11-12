import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { haptic } from '@/lib/haptic';
import { type SwipeDirection, useSwipe } from './use-swipe';

export interface SwipeAction {
  label: string;
  icon: LucideIcon;
  tone: 'primary' | 'danger';
  onCommit: () => void;
}

export type SwipeActions = Partial<Record<SwipeDirection, SwipeAction>>;

interface SwipeRowProps {
  actions: SwipeActions;
  children: ReactNode;
}

// A gesture shortcut only: every swipe action is also reachable with a tap or the keyboard.
export function SwipeRow({ actions, children }: SwipeRowProps) {
  const { offset, isDragging, handlers } = useSwipe({
    canSwipe: (direction) => Boolean(actions[direction]),
    onCommit: (direction) => {
      haptic();
      actions[direction]?.onCommit();
    },
  });
  const revealed = offset > 0 ? actions.right : offset < 0 ? actions.left : undefined;

  return (
    <div className="relative overflow-hidden">
      {revealed && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 flex items-center gap-2 px-4 text-sm font-medium',
            offset > 0 ? 'justify-start' : 'justify-end',
            revealed.tone === 'primary'
              ? 'bg-primary text-primary-foreground'
              : 'bg-danger text-danger-foreground',
          )}
        >
          <revealed.icon className="size-5" />
          {revealed.label}
        </div>
      )}
      <div
        {...handlers}
        style={offset ? { transform: `translateX(${offset}px)` } : undefined}
        className={cn(
          'relative flex touch-pan-y items-center bg-card',
          !isDragging && 'transition-transform duration-200',
        )}
      >
        {children}
      </div>
    </div>
  );
}
