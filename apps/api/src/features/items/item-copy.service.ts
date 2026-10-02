import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CATEGORIES_MAX_COUNT,
  type CopyItemsInput,
  type CopyItemsResultDto,
  ITEMS_MAX_COUNT,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import {
  accessibleBy,
  householdScope,
  personalScope,
  type Scope,
  scopeWhere,
} from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

interface SourceItem {
  name: string;
  description: string | null;
  category: { name: string; icon: string } | null;
}

// FR-I5: copies items into the personal catalog or a household's. The category is matched by
// name in the target, created there when allowed, and otherwise left empty. An item whose name
// already exists in the target is skipped and reported.
@Injectable()
export class ItemCopyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  async copy(user: AuthUser, input: CopyItemsInput): Promise<CopyItemsResultDto> {
    const target =
      input.target.kind === 'personal'
        ? personalScope(user)
        : householdScope(input.target.householdId);
    const { permissions } = await this.access.require(user, target, 'item.create');
    const canCreateCategories = permissions.has('category.create');

    return this.prisma.$transaction(async (tx) => {
      const items = await tx.item.findMany({
        where: { id: { in: input.itemIds }, ...accessibleBy(user) },
        include: { category: { select: { name: true, icon: true } } },
        orderBy: { name: 'asc' },
      });
      if (items.length !== input.itemIds.length)
        throw new NotFoundException('Some items were not found');

      await lockScope(tx, target);
      const existing = await tx.item.findMany({
        where: scopeWhere(target),
        select: { name: true },
      });
      const takenNames = new Set(existing.map(({ name }) => name.toLowerCase()));
      const toCopy = items.filter(({ name }) => !takenNames.has(name.toLowerCase()));
      const skipped = items.filter((item) => !toCopy.includes(item)).map(({ name }) => name);

      if (existing.length + toCopy.length > ITEMS_MAX_COUNT) {
        throw new ConflictException(`The catalog can hold at most ${ITEMS_MAX_COUNT} items`);
      }
      this.writeBudget.spend(user, toCopy.length);

      const categoryIds = await categoryIdsFor(tx, target, toCopy, canCreateCategories);
      await tx.item.createMany({
        data: toCopy.map((item) => ({
          ...scopeWhere(target),
          name: item.name,
          description: item.description,
          categoryId: item.category
            ? (categoryIds.get(item.category.name.toLowerCase()) ?? null)
            : null,
          createdById: user.id,
        })),
      });
      return { copied: toCopy.length, skipped };
    });
  }
}

// Category ids in the target by lower-case name, creating the missing ones where allowed.
async function categoryIdsFor(
  db: DbClient,
  target: Scope,
  items: SourceItem[],
  canCreate: boolean,
): Promise<Map<string, string>> {
  const existing = await db.category.findMany({
    where: scopeWhere(target),
    select: { id: true, name: true, position: true },
  });
  const ids = new Map(existing.map(({ id, name }) => [name.toLowerCase(), id]));
  if (!canCreate) return ids;

  const missing = new Map<string, { name: string; icon: string }>();
  for (const { category } of items) {
    if (category && !ids.has(category.name.toLowerCase())) {
      missing.set(category.name.toLowerCase(), category);
    }
  }
  let position = Math.max(-1, ...existing.map((category) => category.position));
  for (const category of [...missing.values()].slice(0, CATEGORIES_MAX_COUNT - existing.length)) {
    position += 1;
    const created = await db.category.create({
      data: { ...scopeWhere(target), name: category.name, icon: category.icon, position },
    });
    ids.set(category.name.toLowerCase(), created.id);
  }
  return ids;
}
