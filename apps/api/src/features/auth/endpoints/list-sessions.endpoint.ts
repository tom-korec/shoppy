import { Controller, Get } from '@nestjs/common';
import type { SessionDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { SessionsService } from '../sessions.service.js';

@Controller('me/sessions')
export class ListSessionsEndpoint {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<SessionDto[]> {
    return this.sessions.list(user.id, user.sessionId);
  }
}
