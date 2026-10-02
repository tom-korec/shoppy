import { Controller, Get } from '@nestjs/common';
import type { ListViewDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ListViewService } from '../list-view.service.js';

@Controller('me/list-view')
export class GetListViewEndpoint {
  constructor(private readonly listView: ListViewService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<ListViewDto> {
    return this.listView.get(user);
  }
}
