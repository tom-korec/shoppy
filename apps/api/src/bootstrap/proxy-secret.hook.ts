import { ForbiddenException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { timingSafeEqual } from 'node:crypto';

export const PROXY_SECRET_HEADER = 'x-shoppy-proxy-secret';

// Only the Cloudflare Worker knows the secret, so the public Cloud Run URL can't bypass it.
export function createProxySecretHook(secret: string) {
  const expected = Buffer.from(secret);

  return async (request: FastifyRequest): Promise<void> => {
    const provided = request.headers[PROXY_SECRET_HEADER];
    const actual = Buffer.from(typeof provided === 'string' ? provided : '');

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new ForbiddenException();
    }
  };
}
