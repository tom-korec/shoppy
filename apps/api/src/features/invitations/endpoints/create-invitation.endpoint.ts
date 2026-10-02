import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  type CreatedInvitationDto,
  type CreateInvitationInput,
  createInvitationInputSchema,
} from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { InvitationsService } from '../invitations.service.js';

@Controller('households/:id/invitations')
export class CreateInvitationEndpoint {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createInvitationInputSchema)) input: CreateInvitationInput,
  ): Promise<CreatedInvitationDto> {
    return this.invitations.create(user, id, input);
  }
}
