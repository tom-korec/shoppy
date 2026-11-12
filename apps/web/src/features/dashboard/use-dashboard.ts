import { dashboardSchema } from '@shoppy/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export const DASHBOARD_QUERY_KEY = ['dashboard'];

// Kept fresh only briefly: list changes elsewhere don't invalidate it. A few seconds still let the
// route loader's prefetch serve the first render.
export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => apiGet('/me/dashboard', dashboardSchema),
    staleTime: 5_000,
  });

export function useDashboard() {
  return useQuery(dashboardQueryOptions());
}
