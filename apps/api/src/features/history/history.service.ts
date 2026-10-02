import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type HistoryPageDto,
  type HistoryQuery,
  RECENT_HISTORY_BUSY_THRESHOLD,
  type RecentHistoryDto,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { scopeOf } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { findAccessibleList } from '../lists/find-accessible-list.js';
import { touchList } from '../lists/touch-list.js';
import { decodeHistoryCursor, encodeHistoryCursor } from './history-cursor.js';
import { findAccessibleRecord } from './find-accessible-record.js';
import { PURCHASE_RECORD_DTO_INCLUDE, toPurchaseRecordDto } from './purchase-record-dto.js';
import { recentWindowDays, windowStart } from './recent-window-days.js';

const NEWEST_FIRST = [{ boughtAt: 'desc' }, { id: 'desc' }] as const;
const RECENT_MAX_RECORDS = 200;

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
  ) {}

  async page(user: AuthUser, listId: string, query: HistoryQuery): Promise<HistoryPageDto> {
    const list = await findAccessibleList(this.prisma, user, listId, 'read');
    await this.access.require(user, scopeOf(list), 'history.view');
    const after = query.cursor ? decodeHistoryCursor(query.cursor) : undefined;

    const records = await this.prisma.purchaseRecord.findMany({
      where: {
        listId,
        ...(after && {
          OR: [
            { boughtAt: { lt: after.boughtAt } },
            { boughtAt: after.boughtAt, id: { lt: after.id } },
          ],
        }),
      },
      orderBy: [...NEWEST_FIRST],
      take: query.limit + 1,
      include: PURCHASE_RECORD_DTO_INCLUDE,
    });

    const page = records.slice(0, query.limit);
    const last = page.at(-1);
    return {
      records: page.map(toPurchaseRecordDto),
      nextCursor: records.length > query.limit && last ? encodeHistoryCursor(last) : null,
    };
  }

  async recent(user: AuthUser, listId: string): Promise<RecentHistoryDto> {
    const list = await findAccessibleList(this.prisma, user, listId, 'read');
    await this.access.require(user, scopeOf(list), 'history.view');
    const now = new Date();
    const newest = await this.prisma.purchaseRecord.findMany({
      where: { listId },
      orderBy: [...NEWEST_FIRST],
      take: RECENT_HISTORY_BUSY_THRESHOLD,
      select: { boughtAt: true },
    });
    const windowDays = recentWindowDays(newest.at(-1)?.boughtAt, now);

    const records = await this.prisma.purchaseRecord.findMany({
      where: { listId, boughtAt: { gte: windowStart(windowDays, now) } },
      orderBy: [...NEWEST_FIRST],
      take: RECENT_MAX_RECORDS,
      include: PURCHASE_RECORD_DTO_INCLUDE,
    });
    return { records: records.map(toPurchaseRecordDto), windowDays };
  }

  async delete(user: AuthUser, recordId: string): Promise<void> {
    const { list } = await findAccessibleRecord(this.prisma, user, recordId, 'write');
    await this.access.require(user, scopeOf(list), 'history.delete');
    const { count } = await this.prisma.purchaseRecord.deleteMany({ where: { id: recordId } });
    if (count === 0) throw new NotFoundException('History record not found');
    await touchList(this.prisma, list.id);
  }
}
