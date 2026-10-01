import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SessionDto } from '@shoppy/shared';
import { createHmac } from 'node:crypto';
import type { Env } from '../../config/env.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { generateOpaqueToken, hashOpaqueToken } from './opaque-token.js';
import { formatRefreshToken, parseRefreshToken } from './refresh-token.js';

export const SESSION_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;
// Two requests racing with the same cookie (e.g. two tabs on app start) must not look like token theft.
const ROTATION_GRACE_MS = 30 * 1000;

export interface StartedSession {
  sessionId: string;
  userId: string;
  // Undefined when the request lost a rotation race: the cookie set by the winning request stands.
  refreshToken: string | undefined;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly signingKey: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.signingKey = createHmac('sha256', config.get('JWT_SECRET', { infer: true }))
      .update('refresh-token')
      .digest('base64url');
  }

  async start(userId: string, userAgent: string | undefined): Promise<StartedSession> {
    const secret = generateOpaqueToken();
    const session = await this.prisma.sessionFamily.create({
      data: {
        userId,
        currentTokenHash: hashOpaqueToken(secret),
        userAgent: userAgent?.slice(0, 500),
        expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      },
    });
    return { sessionId: session.id, userId, refreshToken: this.format(session.id, secret) };
  }

  async rotate(rawToken: string): Promise<StartedSession> {
    const token = parseRefreshToken(rawToken, this.signingKey);
    if (!token) throw new UnauthorizedException();

    const session = await this.prisma.sessionFamily.findUnique({ where: { id: token.sessionId } });
    const now = new Date();
    if (!session || session.revokedAt || session.expiresAt <= now)
      throw new UnauthorizedException();

    const presentedHash = hashOpaqueToken(token.secret);
    if (presentedHash === session.currentTokenHash) {
      const secret = generateOpaqueToken();
      const { count } = await this.prisma.sessionFamily.updateMany({
        where: { id: session.id, currentTokenHash: presentedHash },
        data: {
          currentTokenHash: hashOpaqueToken(secret),
          previousTokenHash: presentedHash,
          rotatedAt: now,
          lastUsedAt: now,
          expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS),
        },
      });
      const refreshToken = count === 1 ? this.format(session.id, secret) : undefined;
      return { sessionId: session.id, userId: session.userId, refreshToken };
    }

    if (this.isWithinGrace(session, presentedHash, now)) {
      return { sessionId: session.id, userId: session.userId, refreshToken: undefined };
    }

    this.logger.warn(`Refresh token reuse detected, revoking session ${session.id}`);
    await this.revoke(session.id);
    throw new UnauthorizedException();
  }

  async endByToken(rawToken: string): Promise<void> {
    const token = parseRefreshToken(rawToken, this.signingKey);
    if (!token) return;

    const presentedHash = hashOpaqueToken(token.secret);
    await this.prisma.sessionFamily.updateMany({
      where: {
        id: token.sessionId,
        revokedAt: null,
        OR: [{ currentTokenHash: presentedHash }, { previousTokenHash: presentedHash }],
      },
      data: { revokedAt: new Date() },
    });
  }

  findActive(sessionId: string) {
    return this.prisma.sessionFamily.findFirst({
      where: { id: sessionId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { userId: true, user: { select: { emailVerifiedAt: true } } },
    });
  }

  async list(userId: string, currentSessionId: string): Promise<SessionDto[]> {
    const sessions = await this.prisma.sessionFamily.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });
    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt.toISOString(),
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revokeOwn(userId: string, sessionId: string): Promise<void> {
    const { count } = await this.prisma.sessionFamily.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Session not found');
  }

  async revokeAll(
    userId: string,
    options: { except?: string; tx?: Prisma.TransactionClient } = {},
  ): Promise<void> {
    await (options.tx ?? this.prisma).sessionFamily.updateMany({
      where: { userId, revokedAt: null, id: options.except ? { not: options.except } : undefined },
      data: { revokedAt: new Date() },
    });
  }

  private format(sessionId: string, secret: string): string {
    return formatRefreshToken({ sessionId, secret }, this.signingKey);
  }

  private async revoke(sessionId: string): Promise<void> {
    await this.prisma.sessionFamily.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  private isWithinGrace(
    session: { previousTokenHash: string | null; rotatedAt: Date | null },
    presentedHash: string,
    now: Date,
  ): boolean {
    return (
      session.previousTokenHash === presentedHash &&
      session.rotatedAt !== null &&
      now.getTime() - session.rotatedAt.getTime() < ROTATION_GRACE_MS
    );
  }
}
