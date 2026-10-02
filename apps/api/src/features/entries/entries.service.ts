import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateEntryInput,
  EntryDto,
  Permission,
  PromoteEntryInput,
  UpdateEntryInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { scopeOf, scopeWhere } from '../../common/scope/scope.js';
import { isUniqueViolation } from '../../infrastructure/prisma/is-unique-violation.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { assertCategoryInScope } from '../categories/assert-category-in-scope.js';
import { createItem } from '../items/create-item.js';
import { findItemIdByName } from '../items/find-item-id-by-name.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';
import { touchList } from '../lists/touch-list.js';
import { assertListHasRoom } from './assert-list-has-room.js';
import { ENTRY_DTO_INCLUDE, toEntryDto } from './entry-dto.js';
import { findAccessibleEntry } from './find-accessible-entry.js';
import { findExistingEntry } from './find-existing-entry.js';

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  async create(user: AuthUser, listId: string, input: CreateEntryInput): Promise<EntryDto> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const list = await findAccessibleList(tx, user, listId, 'write');
        await this.access.require(user, scopeOf(list), 'entry.add', tx);
        this.writeBudget.spend(user, 1);
        await assertListHasRoom(tx, listId, 1);
        if (input.itemId) {
          const item = await tx.item.findFirst({
            where: { id: input.itemId, ...scopeWhere(scopeOf(list)) },
          });
          if (!item) throw new BadRequestException('Unknown item');
        }
        await assertCategoryInScope(tx, scopeOf(list), input.categoryId);

        const entry = await tx.listEntry.create({
          data: { ...input, listId, addedById: user.id },
          include: ENTRY_DTO_INCLUDE,
        });
        await touchList(tx, listId);
        return toEntryDto(entry);
      });
    } catch (error) {
      if (input.id && isUniqueViolation(error)) {
        return findExistingEntry(this.prisma, user, listId, input.id);
      }
      throw error;
    }
  }

  async update(user: AuthUser, entryId: string, input: UpdateEntryInput): Promise<EntryDto> {
    const { entry, list } = await findAccessibleEntry(this.prisma, user, entryId, 'write');
    await this.access.require(user, scopeOf(list), updatePermissions(input));
    if (input.categoryId !== undefined) {
      if (entry.itemId) {
        throw new BadRequestException('Change the category of a catalog entry on its item');
      }
      await assertCategoryInScope(this.prisma, scopeOf(list), input.categoryId);
    }

    const updated = await this.prisma.listEntry.update({
      where: { id: entryId },
      data: {
        note: input.note,
        categoryId: input.categoryId,
        ...checkedFields(entry, user, input.isChecked),
      },
      include: ENTRY_DTO_INCLUDE,
    });
    await touchList(this.prisma, list.id);
    return toEntryDto(updated);
  }

  async delete(user: AuthUser, entryId: string): Promise<void> {
    const { list } = await findAccessibleEntry(this.prisma, user, entryId, 'write');
    await this.access.require(user, scopeOf(list), 'entry.remove');
    const { count } = await this.prisma.listEntry.deleteMany({ where: { id: entryId } });
    if (count === 0) throw new NotFoundException('Entry not found');
    await touchList(this.prisma, list.id);
  }

  // FR-L7. An item with the same name already in the catalog is linked instead of duplicated.
  async promote(user: AuthUser, entryId: string, input: PromoteEntryInput): Promise<EntryDto> {
    return this.prisma.$transaction(async (tx) => {
      const { entry, list } = await findAccessibleEntry(tx, user, entryId, 'write');
      await this.access.require(user, scopeOf(list), ['entry.edit', 'item.create'], tx);
      this.writeBudget.spend(user, 1);
      if (!entry.text) throw new BadRequestException('The entry is already in the catalog');
      const scope = scopeOf(list);
      const categoryId = input.categoryId === undefined ? entry.categoryId : input.categoryId;
      await assertCategoryInScope(tx, scope, categoryId);

      const itemId =
        (await findItemIdByName(tx, scope, entry.text)) ??
        (await createItem(tx, user, scope, { name: entry.text, categoryId })).id;

      const promoted = await tx.listEntry.update({
        where: { id: entryId },
        data: { itemId, text: null, categoryId: null },
        include: ENTRY_DTO_INCLUDE,
      });
      return toEntryDto(promoted);
    });
  }
}

// Note and category are edits; striking through in shopping mode is checking.
function updatePermissions(input: UpdateEntryInput): Permission[] {
  const isEdit = input.note !== undefined || input.categoryId !== undefined;
  return [
    ...(isEdit ? (['entry.edit'] as const) : []),
    ...(input.isChecked !== undefined ? (['entry.check'] as const) : []),
  ];
}

// Shopping mode: a checked entry stays on the list (struck through) until the trip is finished.
function checkedFields(
  entry: { checkedAt: Date | null },
  user: AuthUser,
  isChecked: boolean | undefined,
) {
  if (isChecked === undefined) return {};
  if (!isChecked) return { checkedAt: null, checkedById: null };
  if (entry.checkedAt) return {};
  return { checkedAt: new Date(), checkedById: user.id };
}
