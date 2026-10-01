import { useQuery } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { authStore } from '@/lib/auth-store';
import { refreshSession } from '@/lib/refresh-session';

// A query rather than a mutation: it runs once on page load and is deduplicated, so React's
// double-mounted effects can't redeem the single-use token twice.
export function useVerifyEmail(token: string) {
  return useQuery({
    queryKey: ['auth', 'verify-email', token],
    queryFn: async () => {
      await apiCommand('POST', '/auth/verify-email', { token });
      if (authStore.getUser()) await refreshSession(authStore);
      return true;
    },
    enabled: token !== '',
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
