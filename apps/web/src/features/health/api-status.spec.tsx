import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ApiStatus } from './api-status';

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ApiStatus />
    </QueryClientProvider>,
  );
}

describe('ApiStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows Online when the API is healthy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          status: 'ok',
          version: '1.2.3',
          checks: { database: 'up' },
          timestamp: new Date().toISOString(),
        }),
      ),
    );

    renderWithClient();

    expect(await screen.findByText('Online')).toBeInTheDocument();
    expect(screen.getByText('· 1.2.3')).toBeInTheDocument();
  });

  it('shows Unreachable when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 502 })));

    renderWithClient();

    expect(await screen.findByText('Unreachable')).toBeInTheDocument();
  });
});
