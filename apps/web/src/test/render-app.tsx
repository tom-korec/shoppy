import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { UserDto } from '@shoppy/shared';
import { authStore } from '@/lib/auth-store';
import { routeTree } from '@/routeTree.gen';

export function renderApp(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    routeTree,
    context: { queryClient, auth: authStore },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

export function buildUser(overrides: Partial<UserDto> = {}): UserDto {
  return {
    id: '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b',
    email: 'anna@example.com',
    displayName: 'Anna',
    isEmailVerified: true,
    hasPassword: true,
    hasGoogle: false,
    ...overrides,
  };
}

type Handler = (init: RequestInit | undefined) => Response;

// Routes fetch calls by "METHOD /path"; anything unexpected fails the test loudly.
export function stubApi(routes: Record<string, Handler>) {
  const fetchMock = vi.fn((input: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${input}`;
    const handler = routes[key];
    if (!handler) throw new Error(`Unexpected request: ${key}`);
    return Promise.resolve(handler(init));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
