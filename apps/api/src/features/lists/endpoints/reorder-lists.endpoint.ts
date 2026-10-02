import { Body, Controller, Put } from '@nestjs/common';
import { type ListViewDto, type ReorderListsInput, reorderListsInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ListViewService } from '../list-view.service.js';

@Controller('me/list-view/order')
export class ReorderListsEndpoint {
  constructor(private readonly listView: ListViewService) {}

  @Put()
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(reorderListsInputSchema)) input: ReorderListsInput,
  ): Promise<ListViewDto> {
    return this.listView.reorder(user, input);
  }
}
