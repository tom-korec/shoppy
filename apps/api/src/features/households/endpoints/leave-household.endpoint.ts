import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households/:id/leave')
export class LeaveHouseholdEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.households.leave(user, id);
  }
}
