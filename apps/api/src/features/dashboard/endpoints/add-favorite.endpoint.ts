import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type AddFavoriteInput, addFavoriteInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { FavoritesService } from '../favorites.service.js';

@Controller('me/favorites')
export class AddFavoriteEndpoint {
  constructor(private readonly favorites: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(addFavoriteInputSchema)) input: AddFavoriteInput,
  ): Promise<void> {
    return this.favorites.add(user, input.listId);
  }
}
