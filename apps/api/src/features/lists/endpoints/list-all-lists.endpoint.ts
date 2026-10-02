import { Controller, Get } from '@nestjs/common';
import type { ListDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ListsService } from '../lists.service.js';

@Controller('lists')
export class ListAllListsEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<ListDto[]> {
    return this.lists.listAll(user);
  }
}
