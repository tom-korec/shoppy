import { API_PREFIX } from '@shoppy/shared';
import type { z } from 'zod';
import { ApiError } from './api-error';

export async function apiGet<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
  const res = await fetch(`${API_PREFIX}${path}`, {
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, await res.json().catch(() => undefined));
  }
  return schema.parse(await res.json());
}
