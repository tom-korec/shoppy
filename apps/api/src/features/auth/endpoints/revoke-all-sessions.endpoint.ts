import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { SessionsService } from '../sessions.service.js';

@Controller('me/sessions')
export class RevokeAllSessionsEndpoint {
  constructor(private readonly sessions: SessionsService) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser): Promise<void> {
    return this.sessions.revokeAll(user.id);
  }
}
