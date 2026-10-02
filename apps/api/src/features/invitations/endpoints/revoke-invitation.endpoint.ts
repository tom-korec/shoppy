import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { InvitationsService } from '../invitations.service.js';

@Controller('invitations')
export class RevokeInvitationEndpoint {
  constructor(private readonly invitations: InvitationsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.invitations.revoke(user, id);
  }
}
