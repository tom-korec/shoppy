import { Body, Controller, Post } from '@nestjs/common';
import { type CreateListInput, createListInputSchema, type ListDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ListsService } from '../lists.service.js';

@Controller('scopes/personal/lists')
export class CreateListEndpoint {
  constructor(private readonly lists: ListsService) {}

  @Post()
  handle(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body(new ZodValidationPipe(createListInputSchema)) input: CreateListInput,
  ): Promise<ListDto> {
    return this.lists.create(user, scope, input);
  }
}
