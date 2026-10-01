import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  type CategoryDto,
  type ReorderCategoriesInput,
  reorderCategoriesInputSchema,
} from '@shoppy/shared';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { CategoriesService } from '../categories.service.js';

@Controller('scopes/personal/categories/reorder')
export class ReorderCategoriesEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentScope() scope: Scope,
    @Body(new ZodValidationPipe(reorderCategoriesInputSchema)) input: ReorderCategoriesInput,
  ): Promise<CategoryDto[]> {
    return this.categories.reorder(scope, input);
  }
}
