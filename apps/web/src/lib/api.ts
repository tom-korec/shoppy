import { API_PREFIX } from '@shoppy/shared';
import type { z } from 'zod';
import { ApiError } from './api-error';
import { authStore } from './auth-store';
import { refreshSession } from './refresh-session';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: Method;
  body?: unknown;
}

interface SentRequest {
  res: Response;
  hadAccessToken: boolean;
}

async function send(path: string, { method, body }: RequestOptions): Promise<SentRequest> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const accessToken = authStore.getAccessToken();
  if (accessToken) headers['authorization'] = `Bearer ${accessToken}`;
  if (body !== undefined) headers['content-type'] = 'application/json';

  const res = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  });
  return { res, hadAccessToken: accessToken !== undefined };
}

// An expired access token is renewed once from the refresh cookie and the request is retried.
// A 401 without a token (e.g. wrong password on sign-in) is a real answer, not an expiry.
async function request(path: string, options: RequestOptions): Promise<Response> {
  let { res, hadAccessToken } = await send(path, options);
  if (res.status === 401 && hadAccessToken && (await refreshSession(authStore))) {
    ({ res } = await send(path, options));
  }

  if (!res.ok) {
    const errorBody: unknown = await res.json().catch(() => undefined);
    throw new ApiError(res.status, messageFrom(errorBody) ?? res.statusText, errorBody);
  }
  return res;
}

function messageFrom(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('message' in body)) return undefined;
  return typeof body.message === 'string' ? body.message : undefined;
}

export async function apiGet<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
  const res = await request(path, { method: 'GET' });
  return schema.parse(await res.json());
}

export async function apiSend<S extends z.ZodType>(
  method: Exclude<Method, 'GET'>,
  path: string,
  body: unknown,
  schema: S,
): Promise<z.output<S>> {
  const res = await request(path, { method, body });
  return schema.parse(await res.json());
}

export async function apiCommand(
  method: Exclude<Method, 'GET'>,
  path: string,
  body?: unknown,
): Promise<void> {
  await request(path, { method, body });
}
