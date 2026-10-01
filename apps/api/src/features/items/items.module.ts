import { Module } from '@nestjs/common';
import { CreateItemEndpoint } from './endpoints/create-item.endpoint.js';
import { DeleteItemEndpoint } from './endpoints/delete-item.endpoint.js';
import { ListItemsEndpoint } from './endpoints/list-items.endpoint.js';
import { UpdateItemEndpoint } from './endpoints/update-item.endpoint.js';
import { ItemsService } from './items.service.js';

@Module({
  controllers: [ListItemsEndpoint, CreateItemEndpoint, UpdateItemEndpoint, DeleteItemEndpoint],
  providers: [ItemsService],
})
export class ItemsModule {}
