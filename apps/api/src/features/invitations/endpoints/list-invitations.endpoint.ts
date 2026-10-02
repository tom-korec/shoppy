import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { InvitationDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { InvitationsService } from '../invitations.service.js';

@Controller('households/:id/invitations')
export class ListInvitationsEndpoint {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvitationDto[]> {
    return this.invitations.list(user, id);
  }
}
