import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { type MemberDto, type UpdateMemberInput, updateMemberInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { MembersService } from '../members.service.js';

@Controller('members')
export class UpdateMemberEndpoint {
  constructor(private readonly members: MembersService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateMemberInputSchema)) input: UpdateMemberInput,
  ): Promise<MemberDto> {
    return this.members.update(user, id, input);
  }
}
