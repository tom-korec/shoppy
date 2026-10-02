import { Module } from '@nestjs/common';
import { CreateListEndpoint } from './endpoints/create-list.endpoint.js';
import { DeleteListEndpoint } from './endpoints/delete-list.endpoint.js';
import { GetListEndpoint } from './endpoints/get-list.endpoint.js';
import { GetListViewEndpoint } from './endpoints/get-list-view.endpoint.js';
import { ListAllListsEndpoint } from './endpoints/list-all-lists.endpoint.js';
import { ListListsEndpoint } from './endpoints/list-lists.endpoint.js';
import { ReorderListsEndpoint } from './endpoints/reorder-lists.endpoint.js';
import { UpdateListEndpoint } from './endpoints/update-list.endpoint.js';
import { UpdateListViewEndpoint } from './endpoints/update-list-view.endpoint.js';
import { ListsService } from './lists.service.js';
import { ListViewService } from './list-view.service.js';

@Module({
  controllers: [
    ListAllListsEndpoint,
    ListListsEndpoint,
    CreateListEndpoint,
    GetListEndpoint,
    UpdateListEndpoint,
    DeleteListEndpoint,
    GetListViewEndpoint,
    UpdateListViewEndpoint,
    ReorderListsEndpoint,
  ],
  providers: [ListsService, ListViewService],
})
export class ListsModule {}
