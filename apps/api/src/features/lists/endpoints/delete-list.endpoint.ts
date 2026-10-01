import { Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ListsService } from '../lists.service.js';

@Controller('lists')
export class DeleteListEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lists.delete(user, id);
  }
}
