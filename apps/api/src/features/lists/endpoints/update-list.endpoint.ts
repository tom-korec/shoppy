import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { type ListDto, type UpdateListInput, updateListInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ListsService } from '../lists.service.js';

@Controller('lists')
export class UpdateListEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Patch(':id')
  handle(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateListInputSchema)) input: UpdateListInput,
  ): Promise<ListDto> {
    return this.lists.update(user, id, input);
  }
}
