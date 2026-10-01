import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { BulkResultDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { EntryCheckoutService } from '../entry-checkout.service.js';

@Controller('lists/:listId/finish-shopping')
export class FinishShoppingEndpoint {
  constructor(private readonly checkout: EntryCheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
  ): Promise<BulkResultDto> {
    return this.checkout.finishShopping(user, listId);
  }
}
