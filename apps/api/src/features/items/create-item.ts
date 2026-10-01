import { ConflictException } from '@nestjs/common';
import { type CreateItemInput, ITEMS_MAX_COUNT } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { type Scope, scopeWhere } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { rethrowUniqueViolation } from '../../infrastructure/prisma/rethrow-unique-violation.js';

export const ITEM_NAME_TAKEN = 'An item with this name already exists';

// The caller checks the category (FR-I2) and runs this in a transaction.
export async function createItem(
  db: DbClient,
  user: AuthUser,
  scope: Scope,
  input: CreateItemInput,
) {
  await lockScope(db, scope);
  const count = await db.item.count({ where: scopeWhere(scope) });
  if (count >= ITEMS_MAX_COUNT) {
    throw new ConflictException(`The catalog can hold at most ${ITEMS_MAX_COUNT} items`);
  }
  return db.item
    .create({ data: { ...scopeWhere(scope), ...input, createdById: user.id } })
    .catch(rethrowUniqueViolation(ITEM_NAME_TAKEN));
}
