import { screen } from '@testing-library/react';
import { renderApp, stubApi } from '@/test/render-app';

describe('AppErrorPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('offers a retry when the session check fails on app start', async () => {
    stubApi({ 'POST /api/auth/refresh': () => new Response(null, { status: 502 }) });

    renderApp('/');

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
