import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { hasPendingListChanges } from '@/features/entries/list-cache';
import { cn } from '@/lib/cn';
import { PULL_THRESHOLD_PX, usePullToRefresh } from './use-pull-to-refresh';

export function PullToRefresh() {
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () =>
      queryClient.refetchQueries({
        type: 'active',
        predicate: (query) => !hasPendingListChanges(queryClient, query.queryKey),
      }),
    [queryClient],
  );
  const { distance, isRefreshing } = usePullToRefresh(refresh);
  if (distance === 0 && !isRefreshing) return null;

  return (
    <output
      className="pointer-events-none fixed inset-x-0 top-[env(safe-area-inset-top)] z-50 flex justify-center"
      style={{ transform: `translateY(${distance - 40}px)` }}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-md">
        <RefreshCw
          className={cn(
            'size-5',
            distance >= PULL_THRESHOLD_PX ? 'text-primary' : 'text-muted-foreground',
            isRefreshing && 'motion-safe:animate-spin',
          )}
          style={isRefreshing ? undefined : { transform: `rotate(${distance * 4}deg)` }}
          aria-hidden
        />
      </span>
      <span className="sr-only">{isRefreshing ? 'Refreshing' : 'Pull to refresh'}</span>
    </output>
  );
}
