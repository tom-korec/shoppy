import { type AuthSessionDto, authSessionSchema } from '@shoppy/shared';
import { useMutation } from '@tanstack/react-query';
import { apiSend } from '@/lib/api';
import { authStore } from '@/lib/auth-store';

// Register, password sign-in and Google sign-in all end with a new session.
export function useSessionMutation<TInput>(path: string) {
  return useMutation({
    mutationFn: (input: TInput): Promise<AuthSessionDto> =>
      apiSend('POST', path, input, authSessionSchema),
    onSuccess: (session) => authStore.signIn(session),
  });
}
