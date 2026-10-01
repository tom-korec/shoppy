import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { type HistoryPageDto, type HistoryQuery, historyQuerySchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { HistoryService } from '../history.service.js';

@Controller('lists/:listId/history')
export class GetHistoryEndpoint {
  constructor(private readonly history: HistoryService) {}

  @Get()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
    @Query(new ZodValidationPipe(historyQuerySchema)) query: HistoryQuery,
  ): Promise<HistoryPageDto> {
    return this.history.page(user, listId, query);
  }
}
