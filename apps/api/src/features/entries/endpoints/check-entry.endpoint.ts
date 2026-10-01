import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { PurchaseRecordDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { EntryCheckoutService } from '../entry-checkout.service.js';

@Controller('entries/:id/check')
export class CheckEntryEndpoint {
  constructor(private readonly checkout: EntryCheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseRecordDto> {
    return this.checkout.check(user, id);
  }
}
