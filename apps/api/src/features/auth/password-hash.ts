import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const argon2Async = promisify(argon2);

// OWASP Password Storage Cheat Sheet minimum for Argon2id.
const PARAMS = { memory: 19_456, passes: 2, parallelism: 1, tagLength: 32 } as const;
const PHC_PATTERN = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([\w+/]+)\$([\w+/]+)$/;

export async function hashPassword(password: string): Promise<string> {
  const nonce = randomBytes(16);
  const hash = await argon2Async('argon2id', { message: password, nonce, ...PARAMS });
  return `$argon2id$v=19$m=${PARAMS.memory},t=${PARAMS.passes},p=${PARAMS.parallelism}$${toPhcBase64(nonce)}$${toPhcBase64(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const match = PHC_PATTERN.exec(encoded);
  if (!match) return false;

  const [, memory, passes, parallelism, nonce, expectedHash] = match;
  const expected = Buffer.from(expectedHash ?? '', 'base64');
  const actual = await argon2Async('argon2id', {
    message: password,
    nonce: Buffer.from(nonce ?? '', 'base64'),
    memory: Number(memory),
    passes: Number(passes),
    parallelism: Number(parallelism),
    tagLength: expected.length,
  });
  return timingSafeEqual(actual, expected);
}

// Verifying against this keeps "unknown email" as slow as "wrong password", so timing doesn't reveal accounts.
let dummyHash: Promise<string> | undefined;
export function getDummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  return dummyHash;
}

const toPhcBase64 = (buffer: Buffer): string => buffer.toString('base64').replace(/=+$/, '');
