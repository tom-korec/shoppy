import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { type BulkHistoryInput, bulkHistoryInputSchema, type BulkResultDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HistoryRestoreService } from '../history-restore.service.js';

@Controller('lists/:listId/history/bulk')
export class BulkHistoryEndpoint {
  constructor(private readonly historyRestore: HistoryRestoreService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
    @Body(new ZodValidationPipe(bulkHistoryInputSchema)) input: BulkHistoryInput,
  ): Promise<BulkResultDto> {
    return this.historyRestore.bulk(user, listId, input);
  }
}
