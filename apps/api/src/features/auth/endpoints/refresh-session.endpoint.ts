import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthSessionDto } from '@shoppy/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../../../common/auth/public.decorator.js';
import { RefreshCookie } from '../refresh-cookie.service.js';
import { SessionIssuer } from '../session-issuer.service.js';

@Public()
@Controller('auth/refresh')
export class RefreshSessionEndpoint {
  constructor(
    private readonly sessionIssuer: SessionIssuer,
    private readonly refreshCookie: RefreshCookie,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthSessionDto> {
    const token = this.refreshCookie.read(request);
    if (!token) throw new UnauthorizedException();

    try {
      const { session, refreshToken } = await this.sessionIssuer.refresh(token);
      this.refreshCookie.set(reply, refreshToken);
      return session;
    } catch (error) {
      if (error instanceof UnauthorizedException) this.refreshCookie.clear(reply);
      throw error;
    }
  }
}
