import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  type HouseholdDto,
  type TransferOwnershipInput,
  transferOwnershipInputSchema,
} from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HouseholdsService } from '../households.service.js';

@Controller('households/:id/transfer')
export class TransferOwnershipEndpoint {
  constructor(private readonly households: HouseholdsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(transferOwnershipInputSchema)) input: TransferOwnershipInput,
  ): Promise<HouseholdDto> {
    return this.households.transfer(user, id, input);
  }
}
