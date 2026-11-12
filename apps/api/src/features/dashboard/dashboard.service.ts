import { Injectable } from '@nestjs/common';
import { type DashboardDto, RECENT_LISTS_COUNT } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import { RateLimiter, type RateLimitRule } from '../../common/rate-limit/rate-limiter.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';
import { LIST_DTO_INCLUDE, toListDto } from '../lists/list-dto.js';

// Every list opening writes a row; far above real use, it caps what a scripted loop can cost.
export const LIST_VISIT_RATE_LIMIT: RateLimitRule = { limit: 60, windowMs: 60_000 };

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  // Rows of lists the user lost access to stay, so they come back if access does.
  async get(user: AuthUser): Promise<DashboardDto> {
    const visibleList = { ...accessibleBy(user), archivedAt: null };
    const [favorites, visits] = await Promise.all([
      this.prisma.favoriteList.findMany({
        where: { userId: user.id, list: visibleList },
        orderBy: { position: 'asc' },
        include: { list: { include: LIST_DTO_INCLUDE } },
      }),
      this.prisma.listVisit.findMany({
        where: {
          userId: user.id,
          list: { ...visibleList, favorites: { none: { userId: user.id } } },
        },
        orderBy: { lastOpenedAt: 'desc' },
        take: RECENT_LISTS_COUNT,
        include: { list: { include: LIST_DTO_INCLUDE } },
      }),
    ]);
    return {
      favorites: favorites.map(({ list }) => toListDto(list)),
      recent: visits.map(({ list }) => toListDto(list)),
    };
  }

  async recordVisit(user: AuthUser, listId: string): Promise<void> {
    this.rateLimiter.consume(`visits:user:${user.id}`, LIST_VISIT_RATE_LIMIT);
    await findAccessibleList(this.prisma, user, listId, 'read');
    const now = new Date();
    await this.prisma.listVisit.upsert({
      where: { userId_listId: { userId: user.id, listId } },
      create: { userId: user.id, listId, lastOpenedAt: now },
      update: { lastOpenedAt: now },
    });
  }
}
