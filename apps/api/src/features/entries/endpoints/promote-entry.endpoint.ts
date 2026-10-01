import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { type EntryDto, type PromoteEntryInput, promoteEntryInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { EntriesService } from '../entries.service.js';

@Controller('entries/:id/promote')
export class PromoteEntryEndpoint {
  constructor(private readonly entries: EntriesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(promoteEntryInputSchema)) input: PromoteEntryInput,
  ): Promise<EntryDto> {
    return this.entries.promote(user, id, input);
  }
}
