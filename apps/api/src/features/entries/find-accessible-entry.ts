import { NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { findAccessibleList, type ListAccess } from '../lists/find-accessible-list.js';

export async function findAccessibleEntry(
  db: DbClient,
  user: AuthUser,
  entryId: string,
  access: ListAccess,
) {
  const entry = await db.listEntry.findFirst({
    where: { id: entryId, list: accessibleBy(user) },
  });
  if (!entry) throw new NotFoundException('Entry not found');
  const list = await findAccessibleList(db, user, entry.listId, access);
  return { entry, list };
}
