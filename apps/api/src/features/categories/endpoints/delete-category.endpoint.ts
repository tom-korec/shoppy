import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { CategoriesService } from '../categories.service.js';

@Controller('categories')
export class DeleteCategoryEndpoint {
  constructor(private readonly categories: CategoriesService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categories.delete(user, id);
  }
}
