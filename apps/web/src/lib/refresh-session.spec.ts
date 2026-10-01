import { buildUser, stubApi } from '@/test/render-app';
import { AuthStore } from './auth-store';
import { refreshSession } from './refresh-session';

describe('refreshSession', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shares one request between concurrent callers', async () => {
    const fetchMock = stubApi({
      'POST /api/auth/refresh': () => Response.json({ accessToken: 'token', user: buildUser() }),
    });
    const store = new AuthStore();

    const [first, second] = await Promise.all([refreshSession(store), refreshSession(store)]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(store.getAccessToken()).toBe('token');
  });

  it('signs out when there is no valid refresh cookie', async () => {
    stubApi({ 'POST /api/auth/refresh': () => new Response(null, { status: 401 }) });
    const store = new AuthStore();

    const user = await refreshSession(store);

    expect(user).toBeUndefined();
    expect(store.getState().status).toBe('signed-out');
  });
});
