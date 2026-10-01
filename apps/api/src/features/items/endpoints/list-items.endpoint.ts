import { Controller, Get } from '@nestjs/common';
import type { ItemDto } from '@shoppy/shared';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ItemsService } from '../items.service.js';

@Controller('scopes/personal/items')
export class ListItemsEndpoint {
  constructor(private readonly items: ItemsService) {}

  @Get()
  handle(@CurrentScope() scope: Scope): Promise<ItemDto[]> {
    return this.items.list(scope);
  }
}
