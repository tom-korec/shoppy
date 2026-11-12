import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiCommand } from '@/lib/api';
import { DASHBOARD_QUERY_KEY } from './use-dashboard';

// FR-D3: opening a list (or shopping from it) makes it recently used.
export function useRecordVisit(listId: string) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id: string) => apiCommand('POST', `/lists/${id}/visits`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
  });

  useEffect(() => {
    mutate(listId);
  }, [mutate, listId]);
}
