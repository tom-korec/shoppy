import { ConflictException } from '@nestjs/common';
import { ENTRIES_MAX_PER_LIST } from '@shoppy/shared';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';

// Locks the list first, so parallel requests can't all pass the count and overshoot the limit.
// Call inside a transaction.
export async function assertListHasRoom(
  db: DbClient,
  listId: string,
  adding: number,
): Promise<void> {
  await db.$queryRaw`SELECT 1 FROM lists WHERE id = ${listId}::uuid FOR NO KEY UPDATE`;
  const count = await db.listEntry.count({ where: { listId } });
  if (count + adding > ENTRIES_MAX_PER_LIST) {
    throw new ConflictException(`A list can hold at most ${ENTRIES_MAX_PER_LIST} entries`);
  }
}
