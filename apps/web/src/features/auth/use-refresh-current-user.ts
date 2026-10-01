import { userSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

// The email is usually confirmed in another browser (the mail app's), so the pending screen
// re-reads the profile whenever the app comes back into focus.
export function useRefreshCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await apiGet('/me', userSchema);
      authStore.setUser(user);
      return user;
    },
    refetchOnWindowFocus: 'always',
    staleTime: 0,
  });
}
