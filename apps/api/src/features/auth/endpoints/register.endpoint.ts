import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { type AuthSessionDto, registerInputSchema, type RegisterInput } from '@shoppy/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { RefreshCookie } from '../refresh-cookie.service.js';
import { PasswordAuthService } from '../password-auth.service.js';

@Public()
@Controller('auth/register')
export class RegisterEndpoint {
  constructor(
    private readonly auth: PasswordAuthService,
    private readonly refreshCookie: RefreshCookie,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body(new ZodValidationPipe(registerInputSchema)) input: RegisterInput,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionDto> {
    const { session, refreshToken } = await this.auth.register(input, toClientInfo(request));
    this.refreshCookie.set(reply, refreshToken);
    return session;
  }
}
