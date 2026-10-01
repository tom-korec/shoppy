import { createFileRoute } from '@tanstack/react-router';
import { listRouteParams } from '@/features/lists/list-route-params';
import { ListPage } from '@/features/entries/list-page';

export const Route = createFileRoute('/_authenticated/lists/$listId/')({
  params: listRouteParams,
  component: ListPage,
});
