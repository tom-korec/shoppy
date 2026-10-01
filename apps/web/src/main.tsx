import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { authStore } from './lib/auth-store';
import { createQueryClient } from './lib/query-client';
import { initSentry } from './lib/sentry';
import { routeTree } from './routeTree.gen';
import './index.css';

initSentry();

const queryClient = createQueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient, auth: authStore },
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
