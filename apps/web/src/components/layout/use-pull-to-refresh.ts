import { useEffect, useRef, useState } from 'react';
import { haptic } from '@/lib/haptic';

export const PULL_THRESHOLD_PX = 64;
const PULL_MAX_PX = 96;
const PULL_RESISTANCE = 0.5;

// The installed app has no browser pull-to-refresh (and `overscroll-behavior` turns it off in the
// browser too), so pulling down at the top of a page refreshes its data. Open dialogs and drag
// handles keep their own gestures.
export function usePullToRefresh(onRefresh: () => Promise<unknown>) {
  const [distance, setDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    let pulled = 0;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      const target = event.target instanceof Element ? event.target : null;
      if (!touch || window.scrollY > 0 || isRefreshingRef.current) return;
      if (document.querySelector('dialog[open]') || target?.closest('[data-drag-handle]')) return;
      start = { x: touch.clientX, y: touch.clientY };
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!start || !touch) return;
      const dy = touch.clientY - start.y;
      const dx = touch.clientX - start.x;
      if (pulled === 0 && (dy <= 0 || Math.abs(dx) > dy)) {
        start = null;
        return;
      }
      pulled = Math.min(PULL_MAX_PX, Math.max(0, dy * PULL_RESISTANCE));
      setDistance(pulled);
    };

    const onEnd = () => {
      if (!start) return;
      start = null;
      const shouldRefresh = pulled >= PULL_THRESHOLD_PX;
      pulled = 0;
      if (!shouldRefresh) {
        setDistance(0);
        return;
      }
      haptic();
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setDistance(PULL_THRESHOLD_PX);
      void onRefresh().finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setDistance(0);
      });
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [onRefresh]);

  return { distance, isRefreshing };
}
