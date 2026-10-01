import { API_PREFIX, authSessionSchema, type UserDto } from '@shoppy/shared';
import { ApiError } from './api-error';
import type { AuthStore } from './auth-store';

let inFlight: Promise<UserDto | undefined> | undefined;

// Concurrent callers share one request: parallel refreshes with the same cookie would otherwise
// race the server-side token rotation.
export function refreshSession(store: AuthStore): Promise<UserDto | undefined> {
  inFlight ??= requestRefresh(store).finally(() => {
    inFlight = undefined;
  });
  return inFlight;
}

async function requestRefresh(store: AuthStore): Promise<UserDto | undefined> {
  const res = await fetch(`${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });

  if (res.status === 401) {
    store.signOut();
    return undefined;
  }
  if (!res.ok) throw new ApiError(res.status, res.statusText);

  const session = authSessionSchema.parse(await res.json());
  store.signIn(session);
  return session.user;
}

export async function ensureSession(store: AuthStore): Promise<UserDto | undefined> {
  const state = store.getState();
  if (state.status === 'signed-in') return state.user;
  if (state.status === 'signed-out') return undefined;
  return refreshSession(store);
}
