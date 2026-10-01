import { userSchema } from '@shoppy/shared';
import { buildUser, stubApi } from '@/test/render-app';
import { apiCommand, apiGet } from './api';
import { ApiError } from './api-error';
import { authStore } from './auth-store';

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renews an expired access token once and retries the request', async () => {
    authStore.signIn({ accessToken: 'expired', user: buildUser() });
    const fetchMock = stubApi({
      'GET /api/me': (init) =>
        new Headers(init?.headers).get('authorization') === 'Bearer fresh'
          ? Response.json(buildUser())
          : new Response(null, { status: 401 }),
      'POST /api/auth/refresh': () => Response.json({ accessToken: 'fresh', user: buildUser() }),
    });

    const user = await apiGet('/me', userSchema);

    expect(user.email).toBe('anna@example.com');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('signs out when the session can no longer be renewed', async () => {
    authStore.signIn({ accessToken: 'expired', user: buildUser() });
    stubApi({
      'GET /api/me': () => new Response(null, { status: 401 }),
      'POST /api/auth/refresh': () => new Response(null, { status: 401 }),
    });

    await expect(apiGet('/me', userSchema)).rejects.toBeInstanceOf(ApiError);
    expect(authStore.getState().status).toBe('signed-out');
  });

  it('passes the server message on in the error', async () => {
    stubApi({
      'GET /api/me': () => Response.json({ message: 'Nope' }, { status: 400 }),
    });

    await expect(apiGet('/me', userSchema)).rejects.toMatchObject({ status: 400, message: 'Nope' });
  });

  it('does not retry a 401 for a request sent without a token', async () => {
    authStore.signOut();
    const fetchMock = stubApi({
      'POST /api/auth/login': () => Response.json({ message: 'Wrong' }, { status: 401 }),
    });

    await expect(apiCommand('POST', '/auth/login', {})).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
