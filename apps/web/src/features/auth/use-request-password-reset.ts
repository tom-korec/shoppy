import type { ForgotPasswordInput } from '@shoppy/shared';
import { useMutation } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => apiCommand('POST', '/auth/forgot-password', input),
  });
}
