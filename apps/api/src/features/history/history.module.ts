import { Module } from '@nestjs/common';
import { BulkHistoryEndpoint } from './endpoints/bulk-history.endpoint.js';
import { DeleteHistoryRecordEndpoint } from './endpoints/delete-history-record.endpoint.js';
import { GetHistoryEndpoint } from './endpoints/get-history.endpoint.js';
import { GetRecentHistoryEndpoint } from './endpoints/get-recent-history.endpoint.js';
import { ReaddHistoryRecordEndpoint } from './endpoints/readd-history-record.endpoint.js';
import { RestoreHistoryRecordEndpoint } from './endpoints/restore-history-record.endpoint.js';
import { HistoryRestoreService } from './history-restore.service.js';
import { HistoryService } from './history.service.js';

@Module({
  controllers: [
    GetHistoryEndpoint,
    GetRecentHistoryEndpoint,
    RestoreHistoryRecordEndpoint,
    ReaddHistoryRecordEndpoint,
    DeleteHistoryRecordEndpoint,
    BulkHistoryEndpoint,
  ],
  providers: [HistoryService, HistoryRestoreService],
})
export class HistoryModule {}
