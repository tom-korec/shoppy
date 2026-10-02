import { DEFAULT_CATEGORIES } from '@shoppy/shared';
import { type Scope, scopeWhere } from '../../common/scope/scope.js';
import type { Prisma } from '../../generated/prisma/client.js';

// FR-C1 / FR-C2: every new user and household starts with the predefined categories.
export async function seedDefaultCategories(
  tx: Prisma.TransactionClient,
  scope: Scope,
): Promise<void> {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map((category, position) => ({
      ...category,
      ...scopeWhere(scope),
      position,
    })),
  });
}
