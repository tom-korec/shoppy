import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateListInput,
  type ListDetailDto,
  type ListDto,
  LISTS_MAX_COUNT,
  type UpdateListInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { accessibleBy, type Scope, scopeWhere } from '../../common/scope/scope.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { ENTRY_DTO_INCLUDE, toEntryDto } from '../entries/entry-dto.js';
import { findAccessibleList } from './find-accessible-list.js';
import { LIST_DTO_INCLUDE, toListDto } from './list-dto.js';

@Injectable()
export class ListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  async list(scope: Scope): Promise<ListDto[]> {
    const lists = await this.prisma.list.findMany({
      where: scopeWhere(scope),
      orderBy: { createdAt: 'desc' },
      include: LIST_DTO_INCLUDE,
    });
    return lists.map(toListDto);
  }

  async create(user: AuthUser, scope: Scope, input: CreateListInput): Promise<ListDto> {
    this.writeBudget.spend(user, 1);
    const list = await this.prisma.$transaction(async (tx) => {
      await lockScope(tx, scope);
      const count = await tx.list.count({ where: scopeWhere(scope) });
      if (count >= LISTS_MAX_COUNT) {
        throw new ConflictException(`You can have at most ${LISTS_MAX_COUNT} lists`);
      }
      return tx.list.create({
        data: { ...scopeWhere(scope), ...input, createdById: user.id },
        include: LIST_DTO_INCLUDE,
      });
    });
    return toListDto(list);
  }

  async get(user: AuthUser, id: string): Promise<ListDetailDto> {
    const list = await this.prisma.list.findFirst({
      where: { id, ...accessibleBy(user) },
      include: {
        ...LIST_DTO_INCLUDE,
        entries: { include: ENTRY_DTO_INCLUDE, orderBy: { id: 'asc' } },
      },
    });
    if (!list) throw new NotFoundException('List not found');
    return { ...toListDto(list), entries: list.entries.map(toEntryDto) };
  }

  async update(user: AuthUser, id: string, input: UpdateListInput): Promise<ListDto> {
    const existing = await findAccessibleList(this.prisma, user, id, 'read');
    const { isArchived, ...fields } = input;
    const list = await this.prisma.list.update({
      where: { id },
      data: { ...fields, archivedAt: nextArchivedAt(existing.archivedAt, isArchived) },
      include: LIST_DTO_INCLUDE,
    });
    return toListDto(list);
  }

  async delete(user: AuthUser, id: string): Promise<void> {
    await findAccessibleList(this.prisma, user, id, 'read');
    await this.prisma.list.delete({ where: { id } });
  }
}

function nextArchivedAt(current: Date | null, isArchived: boolean | undefined) {
  if (isArchived === undefined) return undefined;
  if (!isArchived) return null;
  return current ?? new Date();
}
