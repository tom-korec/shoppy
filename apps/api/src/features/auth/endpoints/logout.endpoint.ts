import { Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { RefreshCookie } from '../refresh-cookie.service.js';
import { SessionsService } from '../sessions.service.js';

// Public: it works from the cookie alone, so an expired access token can still log out.
@Public()
@Controller('auth/logout')
export class LogoutEndpoint {
  constructor(
    private readonly sessions: SessionsService,
    private readonly refreshCookie: RefreshCookie,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const token = this.refreshCookie.read(request);
    if (token) await this.sessions.endByToken(token);
    this.refreshCookie.clear(reply);
  }
}
