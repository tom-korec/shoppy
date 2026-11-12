import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { listDetailKey } from '@/features/lists/list-query-keys';
import { hasPendingListChanges } from './list-cache';

const POLL_INTERVAL_MS = 30_000;

// A lightweight sync until real-time updates (Phase 6): an open list picks up changes made by
// others. It skips a beat while the tab is hidden or the user's own changes are on their way,
// since refetching then would drop optimistic entries.
export function usePollList(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (hasPendingListChanges(queryClient, listDetailKey(listId))) return;
      void queryClient.invalidateQueries({ queryKey: listDetailKey(listId), exact: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [queryClient, listId]);
}
