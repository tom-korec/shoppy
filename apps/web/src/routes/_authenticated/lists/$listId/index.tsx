import { createFileRoute } from '@tanstack/react-router';
import { ListPage } from '@/features/entries/list-page';
import { listDetailQueryOptions } from '@/features/entries/use-list-detail';
import { listRouteParams } from '@/features/lists/list-route-params';

export const Route = createFileRoute('/_authenticated/lists/$listId/')({
  params: listRouteParams,
  loader: ({ context, params }) =>
    void context.queryClient.prefetchQuery(listDetailQueryOptions(params.listId)),
  component: ListPage,
});
