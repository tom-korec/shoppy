import { createHash, randomBytes } from 'node:crypto';

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

// Tokens are 256-bit random values, so a fast unsalted hash is enough to keep the DB copy useless.
export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}
