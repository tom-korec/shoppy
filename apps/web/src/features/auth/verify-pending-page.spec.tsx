import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';

describe('VerifyPendingPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends an unverified user here instead of the dashboard', async () => {
    authStore.signIn({ accessToken: 'token', user: buildUser({ isEmailVerified: false }) });
    stubApi({ 'GET /api/me': () => Response.json(buildUser({ isEmailVerified: false })) });

    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
    expect(screen.getByText('anna@example.com')).toBeInTheDocument();
  });

  it('continues to the dashboard once the email is confirmed', async () => {
    authStore.signIn({ accessToken: 'token', user: buildUser({ isEmailVerified: false }) });
    let isVerified = false;
    stubApi({ 'GET /api/me': () => Response.json(buildUser({ isEmailVerified: isVerified })) });
    renderApp('/verify-pending');
    await screen.findByRole('heading', { name: 'Check your inbox' });

    isVerified = true;
    await userEvent.click(screen.getByRole('button', { name: "I've confirmed it" }));

    expect(await screen.findByRole('heading', { name: 'Shoppy' })).toBeInTheDocument();
  });
});
