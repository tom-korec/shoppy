import { Controller, Get } from '@nestjs/common';
import type { ListDto } from '@shoppy/shared';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ListsService } from '../lists.service.js';

@Controller('scopes/personal/lists')
export class ListListsEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Get()
  handle(@CurrentScope() scope: Scope): Promise<ListDto[]> {
    return this.lists.list(scope);
  }
}
