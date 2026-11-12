import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { dashboardQueryOptions } from '@/features/dashboard/use-dashboard';

// Loaders start the data request while the page's code chunk downloads; they don't wait for it,
// so the page renders with its own loading and error states.
export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => void context.queryClient.prefetchQuery(dashboardQueryOptions()),
  component: DashboardPage,
});
