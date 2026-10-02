import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { HouseholdDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households')
export class GetHouseholdEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Get(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HouseholdDto> {
    return this.households.get(user, id);
  }
}
