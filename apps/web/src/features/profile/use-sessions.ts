import { sessionListSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const SESSIONS_QUERY_KEY = ['profile', 'sessions'];

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => apiGet('/me/sessions', sessionListSchema),
  });
}
