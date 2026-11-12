import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { FavoritesService } from '../favorites.service.js';

@Controller('me/favorites')
export class RemoveFavoriteEndpoint {
  constructor(private readonly favorites: FavoritesService) {}

  @Delete(':listId')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
  ): Promise<void> {
    return this.favorites.remove(user, listId);
  }
}
