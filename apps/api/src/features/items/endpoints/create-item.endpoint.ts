import { Body, Controller, Post } from '@nestjs/common';
import { type CreateItemInput, createItemInputSchema, type ItemDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { CurrentScope } from '../../../common/scope/current-scope.decorator.js';
import { scopedPaths } from '../../../common/scope/scoped-paths.js';
import type { Scope } from '../../../common/scope/scope.js';
import { ItemsService } from '../items.service.js';

@Controller()
export class CreateItemEndpoint {
  constructor(private readonly items: ItemsService) {}

  @Post(scopedPaths('items'))
  handle(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body(new ZodValidationPipe(createItemInputSchema)) input: CreateItemInput,
  ): Promise<ItemDto> {
    return this.items.create(user, scope, input);
  }
}
