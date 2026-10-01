import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import type { Scope } from './scope.js';

// Serializes "count, then insert" size checks of one scope: without the lock, parallel requests
// all see the same count and overshoot the limit. NO KEY UPDATE doesn't block inserts that
// merely reference the row.
export async function lockScope(db: DbClient, scope: Scope): Promise<void> {
  await db.$queryRaw`SELECT 1 FROM users WHERE id = ${scope.userId}::uuid FOR NO KEY UPDATE`;
}
