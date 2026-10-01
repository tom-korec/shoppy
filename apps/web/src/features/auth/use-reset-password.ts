import type { ResetPasswordInput } from '@shoppy/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetPasswordInput) => apiCommand('POST', '/auth/reset-password', input),
    // The server ended every session, including one this browser may have had.
    onSuccess: () => {
      authStore.signOut();
      queryClient.clear();
    },
  });
}
