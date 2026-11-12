import { createFileRoute } from '@tanstack/react-router';
import { ListsPage } from '@/features/lists/lists-page';
import { listViewQueryOptions } from '@/features/lists/use-list-view';
import { listsQueryOptions } from '@/features/lists/use-lists';

export const Route = createFileRoute('/_authenticated/lists/')({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(listsQueryOptions());
    void context.queryClient.prefetchQuery(listViewQueryOptions());
  },
  component: ListsPage,
});
