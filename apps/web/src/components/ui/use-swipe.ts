import { type MouseEvent, type PointerEvent, useRef, useState } from 'react';

const AXIS_LOCK_PX = 8;
const COMMIT_RATIO = 0.35;

export type SwipeDirection = 'right' | 'left';

interface SwipeOptions {
  canSwipe: (direction: SwipeDirection) => boolean;
  onCommit: (direction: SwipeDirection) => void;
}

interface Gesture {
  x: number;
  y: number;
  axis: 'x' | 'y' | null;
  width: number;
  offset: number;
}

// Horizontal swipe for touch only (a mouse drag would fight text selection). The first few
// pixels decide the axis, so vertical scrolling stays untouched.
export function useSwipe({ canSwipe, onCommit }: SwipeOptions) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const hasSwiped = useRef(false);

  const reset = () => {
    gesture.current = null;
    setIsDragging(false);
    setOffset(0);
  };

  return {
    offset,
    isDragging,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse') return;
        hasSwiped.current = false;
        gesture.current = {
          x: event.clientX,
          y: event.clientY,
          axis: null,
          width: event.currentTarget.offsetWidth,
          offset: 0,
        };
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const current = gesture.current;
        if (!current) return;
        const dx = event.clientX - current.x;
        const dy = event.clientY - current.y;
        if (!current.axis) {
          if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
          current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
          if (current.axis === 'x') {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsDragging(true);
          }
        }
        if (current.axis !== 'x') return;
        current.offset = canSwipe(dx > 0 ? 'right' : 'left') ? dx : 0;
        setOffset(current.offset);
      },
      onPointerUp: () => {
        const current = gesture.current;
        if (current?.axis === 'x') {
          hasSwiped.current = true;
          if (Math.abs(current.offset) >= current.width * COMMIT_RATIO) {
            onCommit(current.offset > 0 ? 'right' : 'left');
          }
        }
        reset();
      },
      onPointerCancel: reset,
      // The tap that ends a swipe must not also open the row.
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (!hasSwiped.current) return;
        hasSwiped.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    },
  };
}
