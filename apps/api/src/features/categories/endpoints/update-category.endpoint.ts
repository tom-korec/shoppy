import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import {
  type CategoryDto,
  type UpdateCategoryInput,
  updateCategoryInputSchema,
} from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CategoriesService } from '../categories.service.js';

@Controller('categories')
export class UpdateCategoryEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateCategoryInputSchema)) input: UpdateCategoryInput,
  ): Promise<CategoryDto> {
    return this.categories.update(user, id, input);
  }
}
