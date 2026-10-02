import { Injectable } from '@nestjs/common';
import type { ListViewDto, ReorderListsInput, UpdateListViewInput } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

// The user's Lists screen settings: grouping by scope, sort, and their own order of lists.
@Injectable()
export class ListViewService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: AuthUser): Promise<ListViewDto> {
    const [settings, positions] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { listsGrouped: true, listsSort: true },
      }),
      this.prisma.listPosition.findMany({
        where: { userId: user.id, list: accessibleBy(user) },
        orderBy: { position: 'asc' },
        select: { listId: true },
      }),
    ]);
    return {
      isGrouped: settings.listsGrouped,
      sort: settings.listsSort,
      customOrder: positions.map(({ listId }) => listId),
    };
  }

  async update(user: AuthUser, input: UpdateListViewInput): Promise<ListViewDto> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { listsGrouped: input.isGrouped, listsSort: input.sort },
    });
    return this.get(user);
  }

  // Lists the user can't see are dropped; lists missing from the order go after it.
  async reorder(user: AuthUser, input: ReorderListsInput): Promise<ListViewDto> {
    await this.prisma.$transaction(async (tx) => {
      const visible = await tx.list.findMany({
        where: { id: { in: input.ids }, ...accessibleBy(user) },
        select: { id: true },
      });
      const visibleIds = new Set(visible.map(({ id }) => id));
      await tx.listPosition.deleteMany({ where: { userId: user.id } });
      await tx.listPosition.createMany({
        data: input.ids
          .filter((id) => visibleIds.has(id))
          .map((listId, position) => ({ userId: user.id, listId, position })),
      });
    });
    return this.get(user);
  }
}
