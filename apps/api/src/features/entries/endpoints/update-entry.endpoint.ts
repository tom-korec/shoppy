import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { type EntryDto, type UpdateEntryInput, updateEntryInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { EntriesService } from '../entries.service.js';

@Controller('entries')
export class UpdateEntryEndpoint {
  constructor(private readonly entries: EntriesService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateEntryInputSchema)) input: UpdateEntryInput,
  ): Promise<EntryDto> {
    return this.entries.update(user, id, input);
  }
}
