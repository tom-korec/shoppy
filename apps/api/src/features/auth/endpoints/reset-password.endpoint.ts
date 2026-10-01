import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { type ResetPasswordInput, resetPasswordInputSchema } from '@shoppy/shared';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { PasswordResetService } from '../password-reset.service.js';

@Public()
@Controller('auth/reset-password')
export class ResetPasswordEndpoint {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handle(
    @Body(new ZodValidationPipe(resetPasswordInputSchema)) input: ResetPasswordInput,
    @Req() request: FastifyRequest,
  ): Promise<void> {
    return this.passwordReset.reset(input, toClientInfo(request).ip);
  }
}
