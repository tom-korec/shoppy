import { getRouteApi } from '@tanstack/react-router';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { BackLink } from '@/components/ui/back-link';
import { ListView } from './list-view';
import { useListDetail } from './use-list-detail';

const route = getRouteApi('/_authenticated/lists/$listId/');

export function ListPage() {
  const { listId } = route.useParams();
  const list = useListDetail(listId);

  if (list.isSuccess) return <ListView list={list.data} />;
  return (
    <Page title="List" width="wide" leading={<BackLink to="/lists" label="Back to lists" />}>
      <QueryState query={list}>{() => null}</QueryState>
    </Page>
  );
}
