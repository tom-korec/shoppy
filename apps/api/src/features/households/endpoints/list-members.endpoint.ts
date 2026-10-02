import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { MemberDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { MembersService } from '../members.service.js';

@Controller('households/:id/members')
export class ListMembersEndpoint {
  constructor(private readonly members: MembersService) {}

  @Get()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MemberDto[]> {
    return this.members.list(user, id);
  }
}
