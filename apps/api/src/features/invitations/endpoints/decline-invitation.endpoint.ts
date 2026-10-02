import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { InvitationRedemptionService } from '../invitation-redemption.service.js';

@Controller('invitations/:id/decline')
export class DeclineInvitationEndpoint {
  constructor(private readonly redemption: InvitationRedemptionService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.redemption.decline(user, id);
  }
}
