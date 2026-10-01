import { listDetailSchema } from '@shoppy/shared';
import { useQuery } from '@tanstack/react-query';
import { listDetailKey } from '@/features/lists/list-query-keys';
import { apiGet } from '@/lib/api';

export function useListDetail(listId: string) {
  return useQuery({
    queryKey: listDetailKey(listId),
    queryFn: () => apiGet(`/lists/${listId}`, listDetailSchema),
  });
}
