import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { type VerifyEmailInput, verifyEmailInputSchema } from '@shoppy/shared';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { EmailVerificationService } from '../email-verification.service.js';

// Public: the link is usually opened in the mail app's browser, not in the installed PWA.
@Public()
@Controller('auth/verify-email')
export class VerifyEmailEndpoint {
  constructor(private readonly emailVerification: EmailVerificationService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @Body(new ZodValidationPipe(verifyEmailInputSchema)) input: VerifyEmailInput,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    return this.emailVerification.verify(input.token, toClientInfo(request).ip);
  }
}
