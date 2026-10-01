import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AllowUnverified } from '../../../common/auth/allow-unverified.decorator.js';
import type { AuthUser } from '../../../common/auth/auth-user.js';
import { CurrentUser } from '../../../common/auth/current-user.decorator.js';
import { EmailVerificationService } from '../email-verification.service.js';

@AllowUnverified()
@Controller('auth/resend-verification')
export class ResendVerificationEndpoint {
  constructor(private readonly emailVerification: EmailVerificationService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(@CurrentUser() user: AuthUser): Promise<void> {
    return this.emailVerification.resend(user.id);
  }
}
