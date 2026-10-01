import { Body, Controller, Post } from '@nestjs/common';
import {
  type CategoryDto,
  type CreateCategoryInput,
  createCategoryInputSchema,
} from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { CategoriesService } from '../categories.service.js';

@Controller('scopes/personal/categories')
export class CreateCategoryEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body(new ZodValidationPipe(createCategoryInputSchema)) input: CreateCategoryInput,
  ): Promise<CategoryDto> {
    return this.categories.create(user, scope, input);
  }
}
