import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';
import { AppErrorPage } from '@/components/layout/app-error-page';
import { NotFoundPage } from '@/components/layout/not-found-page';
import { RootLayout } from '@/components/layout/root-layout';
import type { AuthStore } from '@/lib/auth-store';

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: AppErrorPage,
});
