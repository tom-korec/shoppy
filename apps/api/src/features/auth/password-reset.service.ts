import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ResetPasswordInput } from '@shoppy/shared';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import type { Env } from '../../config/env.js';
import { EmailSender } from '../../infrastructure/email/email-sender.js';
import { resetPasswordTemplate } from '../../infrastructure/email/templates/reset-password.template.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { AUTH_RATE_LIMITS } from './auth-rate-limits.js';
import { EmailTokens } from './email-tokens.service.js';
import { hashPassword } from './password-hash.js';

const LINK_LIFETIME_MS = 60 * 60 * 1000;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
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

  // Answers 204 whether the account exists or not, even when sending fails, so the status code
  // never reveals an account. Google-only users get a link too: that is how they set a password.
  async requestLink(email: string, clientIp: string): Promise<void> {
    this.rateLimiter.consume(`reset:ip:${clientIp}`, AUTH_RATE_LIMITS.emailLinkPerIp);
    this.rateLimiter.consume(`reset:email:${email}`, AUTH_RATE_LIMITS.emailLinkPerAddress);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = await this.emailTokens.issue(user.id, 'RESET_PASSWORD', LINK_LIFETIME_MS);
    const link = new URL('/reset-password', this.appUrl);
    link.searchParams.set('token', token);

    const message = resetPasswordTemplate({
      to: user.email,
      displayName: user.displayName,
      link: link.toString(),
    });
    await this.emailSender.send(message).catch((error: unknown) => {
      this.logger.error(`Password reset email for user ${user.id} failed`, error);
    });
  }

  async reset(input: ResetPasswordInput, clientIp: string): Promise<void> {
    this.rateLimiter.consume(`redeem:ip:${clientIp}`, AUTH_RATE_LIMITS.tokenRedeemPerIp);

    const passwordHash = await hashPassword(input.password);
    const isReset = await this.prisma.$transaction(async (tx) => {
      const userId = await this.emailTokens.redeem(tx, input.token, 'RESET_PASSWORD');
      if (!userId) return false;

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      // Opening the link proves access to the inbox, which also verifies the address.
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      });
      await tx.sessionFamily.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return true;
    });

    if (!isReset) throw new BadRequestException('This link is invalid or has expired');
  }
}
