import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildUser, renderApp, stubApi } from '@/test/render-app';

describe('SignInPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a signed-out visitor from the dashboard to sign in', async () => {
    stubApi({ 'POST /api/auth/refresh': () => new Response(null, { status: 401 }) });

    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows field errors without calling the API', async () => {
    const fetchMock = stubApi({});
    renderApp('/sign-in');

    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the server message for wrong credentials', async () => {
    stubApi({
      'POST /api/auth/login': () =>
        Response.json({ message: 'Wrong email or password' }, { status: 401 }),
    });
    renderApp('/sign-in');

    await userEvent.type(await screen.findByLabelText('Email'), 'anna@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Wrong1234');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password');
  });

  it('signs in and continues to the page the user came from', async () => {
    stubApi({
      'POST /api/auth/login': () => Response.json({ accessToken: 'token', user: buildUser() }),
    });
    renderApp('/sign-in?redirect=%2Flists');

    await userEvent.type(await screen.findByLabelText('Email'), 'anna@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Lists' })).toBeInTheDocument();
  });
});
