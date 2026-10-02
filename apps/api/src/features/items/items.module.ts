import { Module } from '@nestjs/common';
import { CopyItemsEndpoint } from './endpoints/copy-items.endpoint.js';
import { CreateItemEndpoint } from './endpoints/create-item.endpoint.js';
import { DeleteItemEndpoint } from './endpoints/delete-item.endpoint.js';
import { ListItemsEndpoint } from './endpoints/list-items.endpoint.js';
import { UpdateItemEndpoint } from './endpoints/update-item.endpoint.js';
import { ItemCopyService } from './item-copy.service.js';
import { ItemsService } from './items.service.js';

@Module({
  controllers: [
    CopyItemsEndpoint,
    ListItemsEndpoint,
    CreateItemEndpoint,
    UpdateItemEndpoint,
    DeleteItemEndpoint,
  ],
  providers: [ItemsService, ItemCopyService],
})
export class ItemsModule {}
