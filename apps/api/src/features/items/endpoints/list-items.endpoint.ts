import { Controller, Get } from '@nestjs/common';
import type { ItemDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import { scopedPaths } from '../../../common/scope/scoped-paths.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ItemsService } from '../items.service.js';

@Controller()
export class ListItemsEndpoint {
  constructor(private readonly items: ItemsService) {}

  @Get(scopedPaths('items'))
  handle(@CurrentUser() user: AuthUser, @CurrentScope() scope: Scope): Promise<ItemDto[]> {
    return this.items.list(user, scope);
  }
}
