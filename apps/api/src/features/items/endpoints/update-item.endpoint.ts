import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { type ItemDto, type UpdateItemInput, updateItemInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ItemsService } from '../items.service.js';

@Controller('items')
export class UpdateItemEndpoint {
  constructor(private readonly items: ItemsService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateItemInputSchema)) input: UpdateItemInput,
  ): Promise<ItemDto> {
    return this.items.update(user, id, input);
  }
}
