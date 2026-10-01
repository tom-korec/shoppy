import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { RecentHistoryDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { HistoryService } from '../history.service.js';

@Controller('lists/:listId/history/recent')
export class GetRecentHistoryEndpoint {
  constructor(private readonly history: HistoryService) {}

  @Get()
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
  ): Promise<RecentHistoryDto> {
    return this.history.recent(user, listId);
  }
}
