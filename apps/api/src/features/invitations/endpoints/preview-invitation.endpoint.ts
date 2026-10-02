import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type InvitationPreviewDto, type InvitationRef, invitationRefSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { InvitationRedemptionService } from '../invitation-redemption.service.js';

// POST, so the secret token or code travels in the body rather than in a logged URL.
@Controller('invitations/preview')
export class PreviewInvitationEndpoint {
  constructor(private readonly redemption: InvitationRedemptionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(invitationRefSchema)) ref: InvitationRef,
  ): Promise<InvitationPreviewDto> {
    return this.redemption.preview(user, ref);
  }
}
