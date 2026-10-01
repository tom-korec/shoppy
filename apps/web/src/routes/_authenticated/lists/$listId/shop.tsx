import { createFileRoute } from '@tanstack/react-router';
import { listRouteParams } from '@/features/lists/list-route-params';
import { ShoppingPage } from '@/features/entries/shopping-page';

export const Route = createFileRoute('/_authenticated/lists/$listId/shop')({
  params: listRouteParams,
  component: ShoppingPage,
});
