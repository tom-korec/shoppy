import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DISPLAY_NAME_MAX_LENGTH } from '@shoppy/shared';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { seedDefaultCategories } from '../categories/seed-default-categories.js';
import type { AuthResult } from './auth-result.js';
import type { ClientInfo } from './client-info.js';
import { AUTH_RATE_LIMITS } from './auth-rate-limits.js';
import { type GoogleProfile, GoogleIdTokenVerifier } from './google-id-token-verifier.service.js';
import { SessionIssuer } from './session-issuer.service.js';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifier: GoogleIdTokenVerifier,
    private readonly rateLimiter: RateLimiter,
    private readonly sessionIssuer: SessionIssuer,
  ) {}

  async signIn(idToken: string, client: ClientInfo): Promise<AuthResult> {
    this.rateLimiter.consume(`google:ip:${client.ip}`, AUTH_RATE_LIMITS.googlePerIp);

    const profile = await this.verifier.verify(idToken);
    if (!profile.isEmailVerified) throw new UnauthorizedException('Google email is not verified');

    const userId = await this.findOrCreateUser(profile);
    return this.sessionIssuer.start(userId, client);
  }

  private async findOrCreateUser(profile: GoogleProfile): Promise<string> {
    const linkedUserId = await this.findLinkedUserId(profile);
    if (linkedUserId) return linkedUserId;

    const existing = await this.prisma.user.findUnique({ where: { email: profile.email } });
    const created = existing ? this.linkExisting(existing, profile) : this.createUser(profile);

    // Two first sign-ins can race (two devices, or a repeated callback); the loser uses the
    // identity the winner just created.
    return created.catch(async (error: unknown) => {
      const isUniqueViolation =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      const winnerUserId = isUniqueViolation ? await this.findLinkedUserId(profile) : undefined;
      if (!winnerUserId) throw error;
      return winnerUserId;
    });
  }

  private async findLinkedUserId(profile: GoogleProfile): Promise<string | undefined> {
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: { provider: 'GOOGLE', providerUserId: profile.googleUserId },
      },
    });
    return identity?.userId;
  }

  private async linkExisting(
    user: { id: string; emailVerifiedAt: Date | null },
    profile: GoogleProfile,
  ): Promise<string> {
    const isUnverified = user.emailVerifiedAt === null;

    await this.prisma.$transaction(async (tx) => {
      await tx.authIdentity.create({
        data: { userId: user.id, provider: 'GOOGLE', providerUserId: profile.googleUserId },
      });
      if (!isUnverified) return;

      // Whoever registered this unverified account never proved they own the inbox; Google just
      // did. Dropping their password and sessions stops an account pre-hijacking attack (D-38).
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date(), passwordHash: null },
      });
      await tx.sessionFamily.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
    return user.id;
  }

  private async createUser(profile: GoogleProfile): Promise<string> {
    const displayName = (profile.name?.trim() || profile.email.split('@')[0] || 'Shopper').slice(
      0,
      DISPLAY_NAME_MAX_LENGTH,
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: profile.email,
          displayName,
          emailVerifiedAt: new Date(),
          identities: { create: { provider: 'GOOGLE', providerUserId: profile.googleUserId } },
        },
      });
      await seedDefaultCategories(tx, user.id);
      return user.id;
    });
  }
}
