import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORIES_MAX_COUNT,
  type CategoryDto,
  type CreateCategoryInput,
  type Permission,
  type ReorderCategoriesInput,
  type UpdateCategoryInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { accessibleBy, type Scope, scopeOf, scopeWhere } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { rethrowUniqueViolation } from '../../infrastructure/prisma/rethrow-unique-violation.js';
import { CATEGORY_DTO_INCLUDE, toCategoryDto } from './category-dto.js';

const NAME_TAKEN = 'A category with this name already exists';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  async list(user: AuthUser, scope: Scope): Promise<CategoryDto[]> {
    await this.access.grant(user, scope);
    return this.listIn(scope);
  }

  async create(user: AuthUser, scope: Scope, input: CreateCategoryInput): Promise<CategoryDto> {
    await this.access.require(user, scope, 'category.create');
    this.writeBudget.spend(user, 1);
    const category = await this.prisma.$transaction(async (tx) => {
      await lockScope(tx, scope);
      const where = scopeWhere(scope);
      const [count, last] = await Promise.all([
        tx.category.count({ where }),
        tx.category.findFirst({ where, orderBy: { position: 'desc' } }),
      ]);
      if (count >= CATEGORIES_MAX_COUNT) {
        throw new ConflictException(`You can have at most ${CATEGORIES_MAX_COUNT} categories`);
      }
      return tx.category
        .create({
          data: { ...where, ...input, position: (last?.position ?? -1) + 1 },
          include: CATEGORY_DTO_INCLUDE,
        })
        .catch(rethrowUniqueViolation(NAME_TAKEN));
    });
    return toCategoryDto(category);
  }

  async update(user: AuthUser, id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
    await this.findAllowed(user, id, 'category.update');
    const category = await this.prisma.category
      .update({ where: { id }, data: input, include: CATEGORY_DTO_INCLUDE })
      .catch(rethrowUniqueViolation(NAME_TAKEN));
    return toCategoryDto(category);
  }

  // FR-C4: items and one-time entries in the category become uncategorized (FK ON DELETE SET NULL).
  async delete(user: AuthUser, id: string): Promise<void> {
    await this.findAllowed(user, id, 'category.delete');
    await this.prisma.category.deleteMany({ where: { id } });
  }

  async reorder(
    user: AuthUser,
    scope: Scope,
    input: ReorderCategoriesInput,
  ): Promise<CategoryDto[]> {
    await this.access.require(user, scope, 'category.update');
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.category.findMany({
        where: scopeWhere(scope),
        select: { id: true },
      });
      const existingIds = new Set(existing.map(({ id }) => id));
      const isCompleteOrder =
        input.ids.length === existingIds.size && input.ids.every((id) => existingIds.has(id));
      if (!isCompleteOrder) {
        throw new BadRequestException('Send every category exactly once');
      }

      // Rows are updated in id order, so two parallel reorders can't deadlock on each other.
      const positions = input.ids.map((id, position) => ({ id, position }));
      positions.sort((a, b) => a.id.localeCompare(b.id));
      for (const { id, position } of positions) {
        await tx.category.update({ where: { id }, data: { position } });
      }
    });
    return this.listIn(scope);
  }

  private async listIn(scope: Scope): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      where: scopeWhere(scope),
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: CATEGORY_DTO_INCLUDE,
    });
    return categories.map(toCategoryDto);
  }

  private async findAllowed(user: AuthUser, id: string, permission: Permission) {
    const category = await this.prisma.category.findFirst({ where: { id, ...accessibleBy(user) } });
    if (!category) throw new NotFoundException('Category not found');
    await this.access.require(user, scopeOf(category), permission);
    return category;
  }
}
