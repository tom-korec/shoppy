import { Controller, Get } from '@nestjs/common';
import type { DashboardDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { DashboardService } from '../dashboard.service.js';

@Controller('me/dashboard')
export class GetDashboardEndpoint {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<DashboardDto> {
    return this.dashboard.get(user);
  }
}
