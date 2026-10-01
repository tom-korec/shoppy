import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp, stubApi } from '@/test/render-app';

describe('ResetPasswordPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('removes the token from the URL and still uses it', async () => {
    const fetchMock = stubApi({
      'POST /api/auth/refresh': () => new Response(null, { status: 401 }),
      'POST /api/auth/reset-password': () => new Response(null, { status: 204 }),
    });
    const router = renderApp('/reset-password?token=abc123');

    await userEvent.type(await screen.findByLabelText('New password'), 'Brandnew42');
    await userEvent.click(screen.getByRole('button', { name: 'Save password' }));

    expect(await screen.findByRole('heading', { name: 'Password changed' })).toBeInTheDocument();
    expect(router.state.location.href).toBe('/reset-password');
    const resetCall = fetchMock.mock.calls.find(([url]) => url === '/api/auth/reset-password');
    expect(JSON.parse(resetCall?.[1]?.body as string)).toEqual({
      token: 'abc123',
      password: 'Brandnew42',
    });
  });

  it('explains an incomplete link instead of showing the form', async () => {
    stubApi({});

    renderApp('/reset-password');

    expect(await screen.findByRole('heading', { name: 'Link not valid' })).toBeInTheDocument();
  });
});
