import { Controller, Get } from '@nestjs/common';
import type { ListDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import { scopedPaths } from '../../../common/scope/scoped-paths.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ListsService } from '../lists.service.js';

@Controller()
export class ListListsEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Get(scopedPaths('lists'))
  handle(@CurrentUser() user: AuthUser, @CurrentScope() scope: Scope): Promise<ListDto[]> {
    return this.lists.list(user, scope);
  }
}
