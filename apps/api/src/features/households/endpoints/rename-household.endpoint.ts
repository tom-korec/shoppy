import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { type HouseholdDto, type HouseholdInput, householdInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households')
export class RenameHouseholdEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(householdInputSchema)) input: HouseholdInput,
  ): Promise<HouseholdDto> {
    return this.households.rename(user, id, input);
  }
}
