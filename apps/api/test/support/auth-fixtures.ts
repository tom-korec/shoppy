import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { type AuthSessionDto, authSessionSchema } from '@shoppy/shared';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';

export const TEST_PASSWORD = 'Secret123';

export interface RegisteredUser extends AuthSessionDto {
  email: string;
  refreshCookie: string;
}

// Unique per call, so test files can share one database and run in parallel.
export function uniqueEmail(): string {
  return `user-${randomUUID()}@example.com`;
}

export function readRefreshCookie(res: { headers: Record<string, unknown> }): string | undefined {
  const header = res.headers['set-cookie'];
  const cookies = Array.isArray(header) ? header : [header];
  const cookie = cookies.find(
    (value): value is string => typeof value === 'string' && value.startsWith('shoppy_refresh='),
  );
  return cookie?.split(';')[0];
}

export async function registerUser(
  app: NestFastifyApplication,
  options: { isVerified?: boolean; email?: string } = {},
): Promise<RegisteredUser> {
  const email = options.email ?? uniqueEmail();
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { displayName: 'Anna', email, password: TEST_PASSWORD },
  });
  if (res.statusCode !== 201) throw new Error(`Registration failed: ${res.body}`);

  const session = authSessionSchema.parse(res.json());
  if (options.isVerified ?? true) {
    await app.get(PrismaService).user.update({
      where: { id: session.user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }
  return { ...session, email, refreshCookie: readRefreshCookie(res) ?? '' };
}

export function bearer(accessToken: string): { authorization: string } {
  return { authorization: `Bearer ${accessToken}` };
}

export async function signInAgain(
  app: NestFastifyApplication,
  email: string,
  userAgent = 'Another device',
): Promise<AuthSessionDto> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'user-agent': userAgent },
    payload: { email, password: TEST_PASSWORD },
  });
  return authSessionSchema.parse(res.json());
}
