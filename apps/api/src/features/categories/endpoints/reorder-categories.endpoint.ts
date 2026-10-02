import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  type CategoryDto,
  type ReorderCategoriesInput,
  reorderCategoriesInputSchema,
} from '@shoppy/shared';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import { scopedPaths } from '../../../common/scope/scoped-paths.js';
import type { Scope } from '../../../common/scope/scope.js';
import { CategoriesService } from '../categories.service.js';

@Controller()
export class ReorderCategoriesEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Post(scopedPaths('categories/reorder'))
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body(new ZodValidationPipe(reorderCategoriesInputSchema)) input: ReorderCategoriesInput,
  ): Promise<CategoryDto[]> {
    return this.categories.reorder(user, scope, input);
  }
}
