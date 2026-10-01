import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { LoginInput, RegisterInput } from '@shoppy/shared';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { seedDefaultCategories } from '../categories/seed-default-categories.js';
import type { AuthResult } from './auth-result.js';
import type { ClientInfo } from './client-info.js';
import { AUTH_RATE_LIMITS } from './auth-rate-limits.js';
import { EmailVerificationService } from './email-verification.service.js';
import { getDummyPasswordHash, hashPassword, verifyPassword } from './password-hash.js';
import { SessionIssuer } from './session-issuer.service.js';

const EMAIL_TAKEN = 'An account with this email already exists';

@Injectable()
export class PasswordAuthService {
  private readonly logger = new Logger(PasswordAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: RateLimiter,
    private readonly sessionIssuer: SessionIssuer,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  async register(input: RegisterInput, client: ClientInfo): Promise<AuthResult> {
    this.rateLimiter.consume(`register:ip:${client.ip}`, AUTH_RATE_LIMITS.registerPerIp);

    if (await this.prisma.user.findUnique({ where: { email: input.email } })) {
      throw new ConflictException(EMAIL_TAKEN);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma
      .$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { email: input.email, displayName: input.displayName, passwordHash },
        });
        await seedDefaultCategories(tx, created.id);
        return created;
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException(EMAIL_TAKEN);
        }
        throw error;
      });

    // The account exists either way; a failed email can be re-sent from the "check your inbox" screen.
    await this.emailVerification.send(user).catch((error: unknown) => {
      this.logger.error(`Verification email for user ${user.id} failed`, error);
    });

    return this.sessionIssuer.start(user.id, client);
  }

  async login(input: LoginInput, client: ClientInfo): Promise<AuthResult> {
    this.rateLimiter.consume(`login:ip:${client.ip}`, AUTH_RATE_LIMITS.loginPerIp);
    this.rateLimiter.consume(`login:email:${input.email}`, AUTH_RATE_LIMITS.loginPerEmail);

    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    const hash = user?.passwordHash ?? (await getDummyPasswordHash());
    const isValid = await verifyPassword(input.password, hash);

    if (!user?.passwordHash || !isValid) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return this.sessionIssuer.start(user.id, client);
  }
}
