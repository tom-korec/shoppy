import type { Scope } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';

// Exact, case-insensitive name match. (Prisma's `mode: 'insensitive'` compiles to ILIKE, where
// `%` and `_` in a name would act as wildcards.) Uses the lower(name) unique index.
export async function findItemIdByName(
  db: DbClient,
  scope: Scope,
  name: string,
): Promise<string | undefined> {
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM items WHERE owner_user_id = ${scope.userId}::uuid AND lower(name) = lower(${name})`;
  return rows[0]?.id;
}
