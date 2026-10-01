import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { SessionsService } from '../sessions.service.js';

@Controller('me/sessions')
export class RevokeSessionEndpoint {
  constructor(private readonly sessions: SessionsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.sessions.revokeOwn(user.id, id);
  }
}
