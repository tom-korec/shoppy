import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type HouseholdDto, type InvitationRef, invitationRefSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { InvitationRedemptionService } from '../invitation-redemption.service.js';

@Controller('invitations/accept')
export class AcceptInvitationEndpoint {
  constructor(private readonly redemption: InvitationRedemptionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(invitationRefSchema)) ref: InvitationRef,
  ): Promise<HouseholdDto> {
    return this.redemption.accept(user, ref);
  }
}
