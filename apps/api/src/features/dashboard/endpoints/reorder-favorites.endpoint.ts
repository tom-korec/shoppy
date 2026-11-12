import { Body, Controller, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { type ReorderFavoritesInput, reorderFavoritesInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { FavoritesService } from '../favorites.service.js';

@Controller('me/favorites/order')
export class ReorderFavoritesEndpoint {
  constructor(private readonly favorites: FavoritesService) {}

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(reorderFavoritesInputSchema)) input: ReorderFavoritesInput,
  ): Promise<void> {
    return this.favorites.reorder(user, input);
  }
}
