import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { type ForgotPasswordInput, forgotPasswordInputSchema } from '@shoppy/shared';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { PasswordResetService } from '../password-reset.service.js';

@Public()
@Controller('auth/forgot-password')
export class ForgotPasswordEndpoint {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @Body(new ZodValidationPipe(forgotPasswordInputSchema)) input: ForgotPasswordInput,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    return this.passwordReset.requestLink(input.email, toClientInfo(request).ip);
  }
}
