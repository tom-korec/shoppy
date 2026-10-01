import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { toUserDto, USER_DTO_INCLUDE } from '../users/user-dto.js';
import { AccessTokenService } from './access-token.service.js';
import type { AuthResult } from './auth-result.js';
import type { ClientInfo } from './client-info.js';
import { SessionsService, type StartedSession } from './sessions.service.js';

@Injectable()
export class SessionIssuer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly accessTokens: AccessTokenService,
  ) {}

  async start(userId: string, client: ClientInfo): Promise<AuthResult> {
    return this.issue(await this.sessions.start(userId, client.userAgent));
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    return this.issue(await this.sessions.rotate(rawRefreshToken));
  }

  private async issue({ sessionId, userId, refreshToken }: StartedSession): Promise<AuthResult> {
    const [accessToken, user] = await Promise.all([
      this.accessTokens.sign({ userId, sessionId }),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: USER_DTO_INCLUDE }),
    ]);
    return { session: { accessToken, user: toUserDto(user) }, refreshToken };
  }
}
