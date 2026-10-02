import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households')
export class DeleteHouseholdEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.households.delete(user, id);
  }
}
