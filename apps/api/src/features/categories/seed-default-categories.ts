import { DEFAULT_CATEGORIES } from '@shoppy/shared';
import type { Prisma } from '../../generated/prisma/client.js';

export async function seedDefaultCategories(
  tx: Prisma.TransactionClient,
  ownerUserId: string,
): Promise<void> {
  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map((category, position) => ({ ...category, ownerUserId, position })),
  });
}
