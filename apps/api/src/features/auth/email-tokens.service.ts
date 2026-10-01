import { Injectable } from '@nestjs/common';
import type { EmailTokenPurpose, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { generateOpaqueToken, hashOpaqueToken } from './opaque-token.js';

@Injectable()
export class EmailTokens {
  constructor(private readonly prisma: PrismaService) {}

  // Only the newest link of each kind works, so an older email can't be used after a resend.
  async issue(userId: string, purpose: EmailTokenPurpose, lifetimeMs: number): Promise<string> {
    const token = generateOpaqueToken();
    await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({ where: { userId, purpose } }),
      this.prisma.emailToken.create({
        data: {
          userId,
          purpose,
          tokenHash: hashOpaqueToken(token),
          expiresAt: new Date(Date.now() + lifetimeMs),
        },
      }),
    ]);
    return token;
  }

  async redeem(
    tx: Prisma.TransactionClient,
    token: string,
    purpose: EmailTokenPurpose,
  ): Promise<string | undefined> {
    const now = new Date();
    const tokenHash = hashOpaqueToken(token);
    const { count } = await tx.emailToken.updateMany({
      where: { tokenHash, purpose, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (count === 0) return undefined;

    const { userId } = await tx.emailToken.findUniqueOrThrow({ where: { tokenHash } });
    return userId;
  }
}
