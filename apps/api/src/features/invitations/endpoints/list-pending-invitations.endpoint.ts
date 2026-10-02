import { Controller, Get } from '@nestjs/common';
import type { InvitationPreviewDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { InvitationRedemptionService } from '../invitation-redemption.service.js';

@Controller('invitations/pending')
export class ListPendingInvitationsEndpoint {
  constructor(private readonly redemption: InvitationRedemptionService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<InvitationPreviewDto[]> {
    return this.redemption.pending(user);
  }
}
