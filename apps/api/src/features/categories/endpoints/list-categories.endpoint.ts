import { Controller, Get } from '@nestjs/common';
import type { CategoryDto } from '@shoppy/shared';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { CategoriesService } from '../categories.service.js';

@Controller('scopes/personal/categories')
export class ListCategoriesEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  handle(@CurrentScope() scope: Scope): Promise<CategoryDto[]> {
    return this.categories.list(scope);
  }
}
