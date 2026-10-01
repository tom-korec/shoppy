import { NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { findAccessibleList, type ListAccess } from '../lists/find-accessible-list.js';

export async function findAccessibleRecord(
  db: DbClient,
  user: AuthUser,
  recordId: string,
  access: ListAccess,
) {
  const record = await db.purchaseRecord.findFirst({
    where: { id: recordId, list: accessibleBy(user) },
  });
  if (!record) throw new NotFoundException('History record not found');
  const list = await findAccessibleList(db, user, record.listId, access);
  return { record, list };
}
