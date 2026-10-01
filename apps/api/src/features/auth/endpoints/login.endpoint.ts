import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { type AuthSessionDto, loginInputSchema, type LoginInput } from '@shoppy/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { RefreshCookie } from '../refresh-cookie.service.js';
import { PasswordAuthService } from '../password-auth.service.js';

@Public()
@Controller('auth/login')
export class LoginEndpoint {
  constructor(
    private readonly auth: PasswordAuthService,
    private readonly refreshCookie: RefreshCookie,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body(new ZodValidationPipe(loginInputSchema)) input: LoginInput,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionDto> {
    const { session, refreshToken } = await this.auth.login(input, toClientInfo(request));
    this.refreshCookie.set(reply, refreshToken);
    return session;
  }
}
