import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { type EntryDto, type HistoryToEntryInput, historyToEntryInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HistoryRestoreService } from '../history-restore.service.js';

@Controller('history/:id/restore')
export class RestoreHistoryRecordEndpoint {
  constructor(private readonly historyRestore: HistoryRestoreService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(historyToEntryInputSchema)) input: HistoryToEntryInput,
  ): Promise<EntryDto> {
    return this.historyRestore.restore(user, id, input);
  }
}
