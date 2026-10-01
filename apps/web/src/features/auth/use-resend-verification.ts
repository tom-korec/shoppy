import { useMutation } from '@tanstack/react-query';
import { apiCommand } from '@/lib/api';

export function useResendVerification() {
  return useMutation({
    mutationFn: () => apiCommand('POST', '/auth/resend-verification'),
  });
}
