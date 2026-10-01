import { createFileRoute } from '@tanstack/react-router';
import { listRouteParams } from '@/features/lists/list-route-params';
import { HistoryPage } from '@/features/history/history-page';

export const Route = createFileRoute('/_authenticated/lists/$listId/history')({
  params: listRouteParams,
  component: HistoryPage,
});
