import { BadRequestException, Injectable } from '@nestjs/common';
import type { ChangePasswordInput, UpdateMeInput, UserDto } from '@shoppy/shared';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { AUTH_RATE_LIMITS } from '../auth/auth-rate-limits.js';
import { hashPassword, verifyPassword } from '../auth/password-hash.js';
import { SessionsService } from '../auth/sessions.service.js';
import { toUserDto, USER_DTO_INCLUDE } from './user-dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  async get(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: USER_DTO_INCLUDE,
    });
    return toUserDto(user);
  }

  async update(userId: string, input: UpdateMeInput): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { displayName: input.displayName },
      include: USER_DTO_INCLUDE,
    });
    return toUserDto(user);
  }

  // Other devices are signed out; the one that changed the password stays signed in.
  async changePassword(
    userId: string,
    currentSessionId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    // A stolen session must not become an unlimited oracle for the account's password.
    this.rateLimiter.consume(`password:user:${userId}`, AUTH_RATE_LIMITS.loginPerEmail);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is wrong');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await this.sessions.revokeAll(userId, { except: currentSessionId, tx });
    });
  }
}
