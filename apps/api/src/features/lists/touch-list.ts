import type { DbClient } from '../../infrastructure/prisma/db-client.js';

// "Last activity" sort on the Lists screen: any change to the list or its entries and history.
export async function touchList(db: DbClient, listId: string): Promise<void> {
  await db.list.update({ where: { id: listId }, data: { lastActivityAt: new Date() } });
}
