import { Controller, Get } from '@nestjs/common';
import type { HouseholdDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households')
export class ListHouseholdsEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<HouseholdDto[]> {
    return this.households.listMine(user);
  }
}
