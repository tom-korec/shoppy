import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

export function useSignOutEverywhere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiCommand('DELETE', '/me/sessions'),
    onSuccess: () => {
      authStore.signOut();
      queryClient.clear();
    },
  });
}
