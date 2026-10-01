import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  BulkHistoryInput,
  BulkResultDto,
  EntryDto,
  HistoryToEntryInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { scopeOf } from '../../common/scope/scope.js';
import { assertDeletedAll } from '../../infrastructure/prisma/assert-deleted-all.js';
import { isUniqueViolation } from '../../infrastructure/prisma/is-unique-violation.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { assertListHasRoom } from '../entries/assert-list-has-room.js';
import { ENTRY_DTO_INCLUDE, toEntryDto } from '../entries/entry-dto.js';
import { findExistingEntry } from '../entries/find-existing-entry.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';
import { entryFromRecord, loadCategoryIdsByName } from './entry-from-record.js';
import { findAccessibleRecord } from './find-accessible-record.js';

type Mode = 'restore' | 'readd';

// Restore moves a record back onto the list (FR-L14); re-add copies it and keeps the record (FR-L15).
@Injectable()
export class HistoryRestoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  restore(user: AuthUser, recordId: string, input: HistoryToEntryInput): Promise<EntryDto> {
    return this.toEntry('restore', user, recordId, input);
  }

  readd(user: AuthUser, recordId: string, input: HistoryToEntryInput): Promise<EntryDto> {
    return this.toEntry('readd', user, recordId, input);
  }

  // FR-L18: all or nothing.
  async bulk(user: AuthUser, listId: string, input: BulkHistoryInput): Promise<BulkResultDto> {
    return this.prisma.$transaction(async (tx) => {
      const list = await findAccessibleList(tx, user, listId, 'write');
      const records = await tx.purchaseRecord.findMany({
        where: { listId, id: { in: input.ids } },
        orderBy: [{ boughtAt: 'asc' }, { id: 'asc' }],
      });
      if (records.length !== input.ids.length) {
        throw new NotFoundException('Some history records were not found');
      }

      if (input.action !== 'delete') {
        this.writeBudget.spend(user, records.length);
        await assertListHasRoom(tx, listId, records.length);
        const categoryIds = await loadCategoryIdsByName(tx, scopeOf(list));
        await tx.listEntry.createMany({
          data: records.map((record) => ({
            ...entryFromRecord(record, categoryIds),
            addedById: user.id,
          })),
        });
      }
      if (input.action !== 'readd') {
        const { count } = await tx.purchaseRecord.deleteMany({
          where: { listId, id: { in: input.ids } },
        });
        assertDeletedAll(count, records.length);
      }
      return { count: records.length };
    });
  }

  private async toEntry(
    mode: Mode,
    user: AuthUser,
    recordId: string,
    input: HistoryToEntryInput,
  ): Promise<EntryDto> {
    this.writeBudget.spend(user, 1);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const { record, list } = await findAccessibleRecord(tx, user, recordId, 'write');
        await assertListHasRoom(tx, list.id, 1);
        const categoryIds = await loadCategoryIdsByName(tx, scopeOf(list));

        const entry = await tx.listEntry.create({
          data: { ...entryFromRecord(record, categoryIds), id: input.entryId, addedById: user.id },
          include: ENTRY_DTO_INCLUDE,
        });
        if (mode === 'restore') {
          const { count } = await tx.purchaseRecord.deleteMany({ where: { id: recordId } });
          assertDeletedAll(count, 1);
        }
        return toEntryDto(entry);
      });
    } catch (error) {
      if (!input.entryId || !isUniqueViolation(error)) throw error;
      // The failed transaction rolled back, so the record is still there.
      const { record } = await findAccessibleRecord(this.prisma, user, recordId, 'read');
      return findExistingEntry(this.prisma, user, record.listId, input.entryId);
    }
  }
}
