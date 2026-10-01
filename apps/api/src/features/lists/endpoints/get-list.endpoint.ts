import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { ListDetailDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ListsService } from '../lists.service.js';

@Controller('lists')
export class GetListEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Get(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ListDetailDto> {
    return this.lists.get(user, id);
  }
}
