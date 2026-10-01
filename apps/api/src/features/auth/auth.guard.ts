import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EMAIL_NOT_VERIFIED } from '@shoppy/shared';
import type { FastifyRequest } from 'fastify';
import { ALLOW_UNVERIFIED_KEY } from '../../common/auth/allow-unverified.decorator.js';
import { IS_PUBLIC_KEY } from '../../common/auth/public.decorator.js';
import { AccessTokenService } from './access-token.service.js';
import { SessionsService } from './sessions.service.js';

// Every route requires a signed-in, verified user unless marked @Public() or @AllowUnverified().
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenService,
    private readonly sessions: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.hasFlag(context, IS_PUBLIC_KEY)) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.readBearerToken(request);
    if (!token) throw new UnauthorizedException();

    const claims = await this.accessTokens.verify(token).catch(() => {
      throw new UnauthorizedException();
    });

    // Checking the session on every request makes revoking a device take effect immediately.
    const session = await this.sessions.findActive(claims.sessionId);
    if (!session || session.userId !== claims.userId) throw new UnauthorizedException();

    const isEmailVerified = session.user.emailVerifiedAt !== null;
    if (!isEmailVerified && !this.hasFlag(context, ALLOW_UNVERIFIED_KEY)) {
      throw new ForbiddenException({
        message: 'Verify your email first',
        code: EMAIL_NOT_VERIFIED,
      });
    }

    request.user = { id: claims.userId, sessionId: claims.sessionId, isEmailVerified };
    return true;
  }

  private hasFlag(context: ExecutionContext, key: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private readBearerToken(request: FastifyRequest): string | undefined {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    return scheme === 'Bearer' && token ? token : undefined;
  }
}
