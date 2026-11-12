import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { AddFavoriteEndpoint } from './endpoints/add-favorite.endpoint.js';
import { GetDashboardEndpoint } from './endpoints/get-dashboard.endpoint.js';
import { RecordListVisitEndpoint } from './endpoints/record-list-visit.endpoint.js';
import { RemoveFavoriteEndpoint } from './endpoints/remove-favorite.endpoint.js';
import { ReorderFavoritesEndpoint } from './endpoints/reorder-favorites.endpoint.js';
import { FavoritesService } from './favorites.service.js';

@Module({
  controllers: [
    GetDashboardEndpoint,
    AddFavoriteEndpoint,
    RemoveFavoriteEndpoint,
    ReorderFavoritesEndpoint,
    RecordListVisitEndpoint,
  ],
  providers: [DashboardService, FavoritesService],
})
export class DashboardModule {}
