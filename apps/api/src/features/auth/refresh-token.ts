import { createHmac, timingSafeEqual } from 'node:crypto';

export interface RefreshToken {
  sessionId: string;
  secret: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// The session id travels with the secret so an old (already rotated) token still points at its
// family, which is what makes reuse detection possible. The signature proves the server issued
// the token, so knowing a session id alone can't trigger a reuse revocation.
export function formatRefreshToken({ sessionId, secret }: RefreshToken, key: string): string {
  return `${sessionId}.${secret}.${sign(sessionId, secret, key)}`;
}

export function parseRefreshToken(raw: string, key: string): RefreshToken | undefined {
  const [sessionId, secret, signature, ...rest] = raw.split('.');
  if (!sessionId || !secret || !signature || rest.length > 0 || !UUID_PATTERN.test(sessionId)) {
    return undefined;
  }

  const expected = Buffer.from(sign(sessionId, secret, key));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined;
  return { sessionId, secret };
}

function sign(sessionId: string, secret: string, key: string): string {
  return createHmac('sha256', key).update(`${sessionId}.${secret}`).digest('base64url');
}
