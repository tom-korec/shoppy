import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateItemInput, ItemDto, Permission, UpdateItemInput } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { accessibleBy, type Scope, scopeOf, scopeWhere } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { rethrowUniqueViolation } from '../../infrastructure/prisma/rethrow-unique-violation.js';
import { assertCategoryInScope } from '../categories/assert-category-in-scope.js';
import { createItem, ITEM_NAME_TAKEN } from './create-item.js';
import { toItemDto } from './item-dto.js';

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  // The whole catalog of a scope is small enough to send at once; the app searches it on the device.
  async list(user: AuthUser, scope: Scope): Promise<ItemDto[]> {
    await this.access.grant(user, scope);
    const items = await this.prisma.item.findMany({
      where: scopeWhere(scope),
      orderBy: { name: 'asc' },
    });
    return items.map(toItemDto);
  }

  async create(user: AuthUser, scope: Scope, input: CreateItemInput): Promise<ItemDto> {
    await this.access.require(user, scope, 'item.create');
    this.writeBudget.spend(user, 1);
    const item = await this.prisma.$transaction(async (tx) => {
      await assertCategoryInScope(tx, scope, input.categoryId);
      return createItem(tx, user, scope, input);
    });
    return toItemDto(item);
  }

  async update(user: AuthUser, id: string, input: UpdateItemInput): Promise<ItemDto> {
    const existing = await this.findAllowed(user, id, 'item.update');
    await assertCategoryInScope(this.prisma, scopeOf(existing), input.categoryId);
    const item = await this.prisma.item
      .update({ where: { id }, data: input })
      .catch(rethrowUniqueViolation(ITEM_NAME_TAKEN));
    return toItemDto(item);
  }

  // FR-I6: entries of the item stay on their lists as one-time entries with the same name and
  // category. Purchase records keep their name snapshot.
  async delete(user: AuthUser, id: string): Promise<void> {
    const item = await this.findAllowed(user, id, 'item.delete');
    await this.prisma.$transaction([
      this.prisma.listEntry.updateMany({
        where: { itemId: id },
        data: { itemId: null, text: item.name, categoryId: item.categoryId },
      }),
      this.prisma.item.deleteMany({ where: { id } }),
    ]);
  }

  private async findAllowed(user: AuthUser, id: string, permission: Permission) {
    const item = await this.prisma.item.findFirst({ where: { id, ...accessibleBy(user) } });
    if (!item) throw new NotFoundException('Item not found');
    await this.access.require(user, scopeOf(item), permission);
    return item;
  }
}
