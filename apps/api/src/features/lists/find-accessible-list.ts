import { ConflictException, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';

export type ListAccess = 'read' | 'write';

// Archived lists are read-only: their entries and history can't change until unarchived.
export async function findAccessibleList(
  db: DbClient,
  user: AuthUser,
  listId: string,
  access: ListAccess,
) {
  const list = await db.list.findFirst({ where: { id: listId, ...accessibleBy(user) } });
  if (!list) throw new NotFoundException('List not found');
  if (access === 'write' && list.archivedAt) {
    throw new ConflictException('This list is archived');
  }
  return list;
}
