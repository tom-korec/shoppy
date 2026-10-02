import { Controller, Get } from '@nestjs/common';
import type { CategoryDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import { scopedPaths } from '../../../common/scope/scoped-paths.js';
import type { Scope } from '../../../common/scope/scope.js';
import { CategoriesService } from '../categories.service.js';

@Controller()
export class ListCategoriesEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Get(scopedPaths('categories'))
  handle(@CurrentUser() user: AuthUser, @CurrentScope() scope: Scope): Promise<CategoryDto[]> {
    return this.categories.list(user, scope);
  }
}
