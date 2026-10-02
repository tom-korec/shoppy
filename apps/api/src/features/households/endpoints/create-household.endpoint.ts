import { Body, Controller, Post } from '@nestjs/common';
import { type HouseholdDto, type HouseholdInput, householdInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households')
export class CreateHouseholdEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(householdInputSchema)) input: HouseholdInput,
  ): Promise<HouseholdDto> {
    return this.households.create(user, input);
  }
}
