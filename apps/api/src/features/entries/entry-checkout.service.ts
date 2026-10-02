import { Injectable, NotFoundException } from '@nestjs/common';
import type { BulkEntriesInput, BulkResultDto, PurchaseRecordDto } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { assertDeletedAll } from '../../infrastructure/prisma/assert-deleted-all.js';
import { scopeOf } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';
import { touchList } from '../lists/touch-list.js';
import {
  PURCHASE_RECORD_DTO_INCLUDE,
  toPurchaseRecordDto,
} from '../history/purchase-record-dto.js';
import { findAccessibleEntry } from './find-accessible-entry.js';
import { ENTRY_PURCHASE_INCLUDE, toPurchaseRecordData } from './purchase-record-data.js';

// Checking moves entries into history: one transaction inserts the purchase records and
// deletes the entries (docs/03-architecture.md §3.6).
@Injectable()
export class EntryCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  async check(user: AuthUser, entryId: string): Promise<PurchaseRecordDto> {
    return this.prisma.$transaction(async (tx) => {
      const { list } = await findAccessibleEntry(tx, user, entryId, 'write');
      await this.access.require(user, scopeOf(list), 'entry.check', tx);
      this.writeBudget.spend(user, 1);
      const entry = await tx.listEntry.findUniqueOrThrow({
        where: { id: entryId },
        include: ENTRY_PURCHASE_INCLUDE,
      });

      const record = await tx.purchaseRecord.create({
        data: toPurchaseRecordData(entry, { boughtById: user.id, boughtAt: new Date() }),
        include: PURCHASE_RECORD_DTO_INCLUDE,
      });
      const { count } = await tx.listEntry.deleteMany({ where: { id: entryId } });
      assertDeletedAll(count, 1);
      await touchList(tx, list.id);
      return toPurchaseRecordDto(record);
    });
  }

  // FR-L18: all or nothing.
  async bulk(user: AuthUser, listId: string, input: BulkEntriesInput): Promise<BulkResultDto> {
    return this.prisma.$transaction(async (tx) => {
      const list = await findAccessibleList(tx, user, listId, 'write');
      const permission = input.action === 'check' ? 'entry.check' : 'entry.remove';
      await this.access.require(user, scopeOf(list), permission, tx);
      const entries = await tx.listEntry.findMany({
        where: { listId, ...(input.ids && { id: { in: input.ids } }) },
        include: ENTRY_PURCHASE_INCLUDE,
        orderBy: { id: 'asc' },
      });
      if (input.ids && entries.length !== input.ids.length) {
        throw new NotFoundException('Some entries were not found');
      }

      if (input.action === 'check') {
        this.writeBudget.spend(user, entries.length);
        const boughtAt = new Date();
        await tx.purchaseRecord.createMany({
          data: entries.map((entry) =>
            toPurchaseRecordData(entry, { boughtById: user.id, boughtAt }),
          ),
        });
      }
      const { count } = await tx.listEntry.deleteMany({
        where: { id: { in: entries.map(({ id }) => id) } },
      });
      assertDeletedAll(count, entries.length);
      await touchList(tx, listId);
      return { count };
    });
  }

  // Shopping mode "Finish": each record keeps when and by whom its entry was checked.
  async finishShopping(user: AuthUser, listId: string): Promise<BulkResultDto> {
    return this.prisma.$transaction(async (tx) => {
      const list = await findAccessibleList(tx, user, listId, 'write');
      await this.access.require(user, scopeOf(list), 'entry.check', tx);
      const entries = await tx.listEntry.findMany({
        where: { listId, checkedAt: { not: null } },
        include: ENTRY_PURCHASE_INCLUDE,
        orderBy: { checkedAt: 'asc' },
      });
      this.writeBudget.spend(user, entries.length);

      await tx.purchaseRecord.createMany({
        data: entries.map((entry) =>
          toPurchaseRecordData(entry, {
            boughtById: entry.checkedById,
            boughtAt: entry.checkedAt ?? new Date(),
          }),
        ),
      });
      const { count } = await tx.listEntry.deleteMany({
        where: { id: { in: entries.map(({ id }) => id) } },
      });
      assertDeletedAll(count, entries.length);
      await touchList(tx, listId);
      return { count };
    });
  }
}
