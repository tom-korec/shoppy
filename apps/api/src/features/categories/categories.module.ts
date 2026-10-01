import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryEndpoint } from './endpoints/create-category.endpoint.js';
import { DeleteCategoryEndpoint } from './endpoints/delete-category.endpoint.js';
import { ListCategoriesEndpoint } from './endpoints/list-categories.endpoint.js';
import { ReorderCategoriesEndpoint } from './endpoints/reorder-categories.endpoint.js';
import { UpdateCategoryEndpoint } from './endpoints/update-category.endpoint.js';

@Module({
  controllers: [
    ListCategoriesEndpoint,
    CreateCategoryEndpoint,
    ReorderCategoriesEndpoint,
    UpdateCategoryEndpoint,
    DeleteCategoryEndpoint,
  ],
  providers: [CategoriesService],
})
export class CategoriesModule {}
