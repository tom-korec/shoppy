import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { API_PREFIX } from '@shoppy/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../../config/env.js';
import { SESSION_LIFETIME_MS } from './sessions.service.js';

export const REFRESH_COOKIE = 'shoppy_refresh';

@Injectable()
export class RefreshCookie {
  private readonly options;

  constructor(config: ConfigService<Env, true>) {
    this.options = {
      httpOnly: true,
      sameSite: 'strict',
      path: `${API_PREFIX}/auth`,
      // Plain-http local development only: Safari drops Secure cookies on http://localhost.
      secure: config.get('NODE_ENV', { infer: true }) !== 'development',
    } as const;
  }

  // SameSite=Strict still lets sibling *.korec.dev subdomains send the cookie (same site), so
  // browsers that report the fetch origin must report our own.
  read(request: FastifyRequest): string | undefined {
    const fetchSite = request.headers['sec-fetch-site'];
    if (fetchSite !== undefined && fetchSite !== 'same-origin') throw new ForbiddenException();
    return request.cookies[REFRESH_COOKIE];
  }

  set(reply: FastifyReply, token: string | undefined): void {
    if (!token) return;
    reply.setCookie(REFRESH_COOKIE, token, {
      ...this.options,
      maxAge: SESSION_LIFETIME_MS / 1000,
    });
  }

  clear(reply: FastifyReply): void {
    reply.clearCookie(REFRESH_COOKIE, this.options);
  }
}
