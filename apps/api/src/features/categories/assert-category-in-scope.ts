import { BadRequestException } from '@nestjs/common';
import { type Scope, scopeWhere } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';

// FR-I2: an item (or one-time entry) may only use a category of its own scope.
export async function assertCategoryInScope(
  db: DbClient,
  scope: Scope,
  categoryId: string | null | undefined,
): Promise<void> {
  if (!categoryId) return;
  const category = await db.category.findFirst({
    where: { id: categoryId, ...scopeWhere(scope) },
    select: { id: true },
  });
  if (!category) throw new BadRequestException('Unknown category');
}
