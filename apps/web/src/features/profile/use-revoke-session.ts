import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { SESSIONS_QUERY_KEY } from './use-sessions';

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => apiCommand('DELETE', `/me/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY }),
  });
}
