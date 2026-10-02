import { Body, Controller, Patch } from '@nestjs/common';
import {
  type ListViewDto,
  type UpdateListViewInput,
  updateListViewInputSchema,
} from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { ListViewService } from '../list-view.service.js';

@Controller('me/list-view')
export class UpdateListViewEndpoint {
  constructor(private readonly listView: ListViewService) {}

  @Patch()
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateListViewInputSchema)) input: UpdateListViewInput,
  ): Promise<ListViewDto> {
    return this.listView.update(user, input);
  }
}
