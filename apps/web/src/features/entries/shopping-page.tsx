import { getRouteApi } from '@tanstack/react-router';
import { BackLink } from '@/components/ui/back-link';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { ShoppingView } from './shopping-view';
import { useListDetail } from './use-list-detail';

const route = getRouteApi('/_authenticated/lists/$listId/shop');

export function ShoppingPage() {
  const { listId } = route.useParams();
  const list = useListDetail(listId);

  if (list.isSuccess) return <ShoppingView list={list.data} />;
  return (
    <Page
      title="Shopping"
      leading={<BackLink to="/lists/$listId" params={{ listId }} label="Back to the list" />}
    >
      <QueryState query={list}>{() => null}</QueryState>
    </Page>
  );
}
