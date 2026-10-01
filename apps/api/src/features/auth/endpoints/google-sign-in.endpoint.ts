import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  type AuthSessionDto,
  googleSignInInputSchema,
  type GoogleSignInInput,
} from '@shoppy/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { toClientInfo } from '../client-info.js';
import { RefreshCookie } from '../refresh-cookie.service.js';
import { GoogleAuthService } from '../google-auth.service.js';

@Public()
@Controller('auth/google')
export class GoogleSignInEndpoint {
  constructor(
    private readonly auth: GoogleAuthService,
    private readonly refreshCookie: RefreshCookie,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body(new ZodValidationPipe(googleSignInInputSchema)) input: GoogleSignInInput,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionDto> {
    const { session, refreshToken } = await this.auth.signIn(input.idToken, toClientInfo(request));
    this.refreshCookie.set(reply, refreshToken);
    return session;
  }
}
