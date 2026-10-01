import { Controller, Get } from '@nestjs/common';
import type { UserDto } from '@shoppy/shared';
import { AllowUnverified } from '../../../common/auth/allow-unverified.decorator.js';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { UsersService } from '../users.service.js';

@AllowUnverified()
@Controller('me')
export class GetMeEndpoint {
  constructor(private readonly users: UsersService) {}

  @Get()
  handle(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.users.get(user.id);
  }
}
