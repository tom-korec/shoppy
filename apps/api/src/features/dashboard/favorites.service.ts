import { ConflictException, Injectable } from '@nestjs/common';
import { FAVORITES_MAX_COUNT, type ReorderFavoritesInput } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { accessibleBy } from '../../common/scope/scope.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';

// FR-D2: any list the user can see may be starred, whatever their role in its household.
@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // Starring again keeps the list where it is; a new favorite goes last.
  async add(user: AuthUser, listId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockScope(tx, { kind: 'personal', userId: user.id });
      await findAccessibleList(tx, user, listId, 'read');
      const existing = await tx.favoriteList.findUnique({
        where: { userId_listId: { userId: user.id, listId } },
      });
      if (existing) return;
      // Favorites of lists the user can no longer see don't count: they can't unstar them.
      const count = await tx.favoriteList.count({
        where: { userId: user.id, list: accessibleBy(user) },
      });
      if (count >= FAVORITES_MAX_COUNT) {
        throw new ConflictException(`You can have at most ${FAVORITES_MAX_COUNT} favorites`);
      }
      const last = await tx.favoriteList.aggregate({
        where: { userId: user.id },
        _max: { position: true },
      });
      await tx.favoriteList.create({
        data: { userId: user.id, listId, position: (last._max.position ?? -1) + 1 },
      });
    });
  }

  async remove(user: AuthUser, listId: string): Promise<void> {
    await this.prisma.favoriteList.deleteMany({ where: { userId: user.id, listId } });
  }

  // Only favorites the user can see may be placed; the rest (unknown ids, lists they lost access
  // to) keep their relative order after them, so every favorite keeps a distinct position.
  async reorder(user: AuthUser, input: ReorderFavoritesInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockScope(tx, { kind: 'personal', userId: user.id });
      const [favorites, visible] = await Promise.all([
        tx.favoriteList.findMany({
          where: { userId: user.id },
          orderBy: { position: 'asc' },
          select: { listId: true },
        }),
        tx.favoriteList.findMany({
          where: { userId: user.id, list: accessibleBy(user) },
          select: { listId: true },
        }),
      ]);
      const current = favorites.map(({ listId }) => listId);
      const visibleIds = new Set(visible.map(({ listId }) => listId));
      const given = input.ids.filter((id) => visibleIds.has(id));
      const ordered = [...given, ...current.filter((id) => !given.includes(id))];
      await Promise.all(
        ordered.map((listId, position) =>
          tx.favoriteList.update({
            where: { userId_listId: { userId: user.id, listId } },
            data: { position },
          }),
        ),
      );
    });
  }
}
