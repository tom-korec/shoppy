import { Body, Controller, Patch } from '@nestjs/common';
import { type UpdateMeInput, updateMeInputSchema, type UserDto } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { UsersService } from '../users.service.js';

@Controller('me')
export class UpdateMeEndpoint {
  constructor(private readonly users: UsersService) {}

  @Patch()
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateMeInputSchema)) input: UpdateMeInput,
  ): Promise<UserDto> {
    return this.users.update(user.id, input);
  }
}
