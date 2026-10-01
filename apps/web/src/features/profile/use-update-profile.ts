import { type UpdateMeInput, userSchema } from '@shoppy/shared';
import { useMutation } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: UpdateMeInput) => apiSend('PATCH', '/me', input, userSchema),
    onSuccess: (user) => authStore.setUser(user),
  });
}
