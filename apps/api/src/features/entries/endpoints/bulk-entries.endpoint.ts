import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { type BulkEntriesInput, bulkEntriesInputSchema, type BulkResultDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { EntryCheckoutService } from '../entry-checkout.service.js';

@Controller('lists/:listId/entries/bulk')
export class BulkEntriesEndpoint {
  constructor(private readonly checkout: EntryCheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Param('listId', ParseUUIDPipe) listId: string,
    @Body(new ZodValidationPipe(bulkEntriesInputSchema)) input: BulkEntriesInput,
  ): Promise<BulkResultDto> {
    return this.checkout.bulk(user, listId, input);
  }
}
