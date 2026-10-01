import { Module } from '@nestjs/common';
import { CreateListEndpoint } from './endpoints/create-list.endpoint.js';
import { DeleteListEndpoint } from './endpoints/delete-list.endpoint.js';
import { GetListEndpoint } from './endpoints/get-list.endpoint.js';
import { ListListsEndpoint } from './endpoints/list-lists.endpoint.js';
import { UpdateListEndpoint } from './endpoints/update-list.endpoint.js';
import { ListsService } from './lists.service.js';

@Module({
  controllers: [
    ListListsEndpoint,
    CreateListEndpoint,
    GetListEndpoint,
    UpdateListEndpoint,
    DeleteListEndpoint,
  ],
  providers: [ListsService],
})
export class ListsModule {}
