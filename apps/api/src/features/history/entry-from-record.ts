import type { Prisma, PurchaseRecord } from '../../generated/prisma/client.js';
import { type Scope, scopeWhere } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';

export type CategoryIdsByName = Map<string, string>;

export async function loadCategoryIdsByName(
  db: DbClient,
  scope: Scope,
): Promise<CategoryIdsByName> {
  const categories = await db.category.findMany({
    where: scopeWhere(scope),
    select: { id: true, name: true },
  });
  return new Map(categories.map(({ id, name }) => [name.toLowerCase(), id]));
}

// Back on the list, a record becomes a catalog entry again if its item still exists. Otherwise it
// is a one-time entry in the category of the same name, if there still is one.
export function entryFromRecord(
  record: PurchaseRecord,
  categoryIds: CategoryIdsByName,
): Omit<Prisma.ListEntryUncheckedCreateInput, 'addedById'> {
  if (record.itemId) {
    return { listId: record.listId, itemId: record.itemId, note: record.note };
  }
  const categoryName = record.categorySnapshot?.toLowerCase();
  return {
    listId: record.listId,
    text: record.nameSnapshot,
    categoryId: categoryName ? (categoryIds.get(categoryName) ?? null) : null,
    note: record.note,
  };
}
