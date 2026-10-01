import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { type CreateEntryInput, createEntryInputSchema, type EntryDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { EntriesService } from '../entries.service.js';

@Controller('lists/:listId/entries')
export class CreateEntryEndpoint {
  constructor(private readonly entries: EntriesService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
    @Body(new ZodValidationPipe(createEntryInputSchema)) input: CreateEntryInput,
  ): Promise<EntryDto> {
    return this.entries.create(user, listId, input);
  }
}
