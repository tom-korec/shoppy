import { Module } from '@nestjs/common';
import { BulkEntriesEndpoint } from './endpoints/bulk-entries.endpoint.js';
import { CheckEntryEndpoint } from './endpoints/check-entry.endpoint.js';
import { CreateEntryEndpoint } from './endpoints/create-entry.endpoint.js';
import { DeleteEntryEndpoint } from './endpoints/delete-entry.endpoint.js';
import { FinishShoppingEndpoint } from './endpoints/finish-shopping.endpoint.js';
import { PromoteEntryEndpoint } from './endpoints/promote-entry.endpoint.js';
import { UpdateEntryEndpoint } from './endpoints/update-entry.endpoint.js';
import { EntriesService } from './entries.service.js';
import { EntryCheckoutService } from './entry-checkout.service.js';

@Module({
  controllers: [
    CreateEntryEndpoint,
    UpdateEntryEndpoint,
    DeleteEntryEndpoint,
    CheckEntryEndpoint,
    PromoteEntryEndpoint,
    BulkEntriesEndpoint,
    FinishShoppingEndpoint,
  ],
  providers: [EntriesService, EntryCheckoutService],
})
export class EntriesModule {}
