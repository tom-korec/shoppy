import { getRouteApi } from '@tanstack/react-router';
import { BackLink } from '@/components/ui/back-link';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { useListDetail } from '@/features/entries/use-list-detail';
import { HistoryView } from './history-view';

const route = getRouteApi('/_authenticated/lists/$listId/history');

export function HistoryPage() {
  const { listId } = route.useParams();
  const list = useListDetail(listId);

  if (list.isSuccess) return <HistoryView list={list.data} />;
  return (
    <Page
      title="History"
      leading={<BackLink to="/lists/$listId" params={{ listId }} label="Back to the list" />}
    >
      <QueryState query={list}>{() => null}</QueryState>
    </Page>
  );
}
