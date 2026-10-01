import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import type { Env } from '../../config/env.js';
import { EmailSender } from '../../infrastructure/email/email-sender.js';
import { verifyEmailTemplate } from '../../infrastructure/email/templates/verify-email.template.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { AUTH_RATE_LIMITS } from './auth-rate-limits.js';
import { EmailTokens } from './email-tokens.service.js';

const LINK_LIFETIME_MS = 24 * 60 * 60 * 1000;

interface Recipient {
  id: string;
  email: string;
  displayName: string;
}

@Injectable()
export class EmailVerificationService {
  private readonly appUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailTokens: EmailTokens,
    private readonly emailSender: EmailSender,
    private readonly rateLimiter: RateLimiter,
    config: ConfigService<Env, true>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true });
  }

  async send(user: Recipient): Promise<void> {
    const token = await this.emailTokens.issue(user.id, 'VERIFY_EMAIL', LINK_LIFETIME_MS);
    const link = new URL('/verify-email', this.appUrl);
    link.searchParams.set('token', token);

    await this.emailSender.send(
      verifyEmailTemplate({ to: user.email, displayName: user.displayName, link: link.toString() }),
    );
  }

  async resend(userId: string): Promise<void> {
    this.rateLimiter.consume(`verify:user:${userId}`, AUTH_RATE_LIMITS.emailLinkPerAddress);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerifiedAt) return;
    await this.send(user);
  }

  async verify(token: string, clientIp: string): Promise<void> {
    this.rateLimiter.consume(`redeem:ip:${clientIp}`, AUTH_RATE_LIMITS.tokenRedeemPerIp);

    const isVerified = await this.prisma.$transaction(async (tx) => {
      const userId = await this.emailTokens.redeem(tx, token, 'VERIFY_EMAIL');
      if (!userId) return false;
      await tx.user.updateMany({
        where: { id: userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: new Date() },
      });
      return true;
    });

    if (!isVerified) throw new BadRequestException('This link is invalid or has expired');
  }
}
