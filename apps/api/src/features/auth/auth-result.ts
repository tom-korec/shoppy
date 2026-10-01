import type { AuthSessionDto } from '@shoppy/shared';

export interface AuthResult {
  session: AuthSessionDto;
  refreshToken: string | undefined;
}
