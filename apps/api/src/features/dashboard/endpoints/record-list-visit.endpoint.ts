import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { DashboardService } from '../dashboard.service.js';

@Controller('lists')
export class RecordListVisitEndpoint {
  constructor(private readonly dashboard: DashboardService) {}

  @Post(':id/visits')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.dashboard.recordVisit(user, id);
  }
}
