import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type CopyItemsInput, copyItemsInputSchema, type CopyItemsResultDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ItemCopyService } from '../item-copy.service.js';

@Controller('items/copy')
export class CopyItemsEndpoint {
  constructor(private readonly itemCopy: ItemCopyService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(copyItemsInputSchema)) input: CopyItemsInput,
  ): Promise<CopyItemsResultDto> {
    return this.itemCopy.copy(user, input);
  }
}
