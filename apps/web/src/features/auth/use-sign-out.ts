import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiCommand('POST', '/auth/logout'),
    // Signed out locally even if the request fails: the user asked to leave this device.
    onSettled: () => {
      authStore.signOut();
      queryClient.clear();
    },
  });
}
