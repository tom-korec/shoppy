import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { type ChangePasswordInput, changePasswordInputSchema } from '@shoppy/shared';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { UsersService } from '../users.service.js';

@Controller('me/password')
export class ChangePasswordEndpoint {
  constructor(private readonly users: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(changePasswordInputSchema)) input: ChangePasswordInput,
  ): Promise<void> {
    return this.users.changePassword(user.id, user.sessionId, input);
  }
}
