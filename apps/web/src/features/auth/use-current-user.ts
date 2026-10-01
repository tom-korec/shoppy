import type { UserDto } from '@shoppy/shared';
import { useAuth } from './use-auth';

// For screens behind the authenticated layout, which only renders once a user is signed in.
export function useCurrentUser(): UserDto {
  const auth = useAuth();
  if (auth.status !== 'signed-in') throw new Error('useCurrentUser needs a signed-in user');
  return auth.user;
}
