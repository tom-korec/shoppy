import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { authSessionSchema } from '@shoppy/shared';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import { readRefreshCookie, registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('POST /api/auth/refresh', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const refresh = (cookie?: string, headers: Record<string, string> = {}) =>
    app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: cookie ? { cookie, ...headers } : headers,
    });

  const pushRotationIntoThePast = (sessionCookie: string) =>
    app.get(PrismaService).sessionFamily.update({
      where: { id: sessionCookie.split('=')[1]?.split('.')[0] },
      data: { rotatedAt: new Date(Date.now() - 60_000) },
    });

  it('returns a new access token and rotates the cookie', async () => {
    const user = await registerUser(app);

    const res = await refresh(user.refreshCookie);

    expect(res.statusCode).toBe(200);
    expect(authSessionSchema.parse(res.json()).user.id).toBe(user.user.id);
    const rotated = readRefreshCookie(res);
    expect(rotated).toBeDefined();
    expect(rotated).not.toBe(user.refreshCookie);
  });

  it('accepts the previous cookie right after rotation without rotating again', async () => {
    const user = await registerUser(app);
    await refresh(user.refreshCookie);

    const res = await refresh(user.refreshCookie);

    expect(res.statusCode).toBe(200);
    expect(readRefreshCookie(res)).toBeUndefined();
  });

  it('revokes the whole session when an old cookie is reused later', async () => {
    const user = await registerUser(app);
    const rotated = readRefreshCookie(await refresh(user.refreshCookie)) ?? '';
    await pushRotationIntoThePast(rotated);

    const reuse = await refresh(user.refreshCookie);
    const afterReuse = await refresh(rotated);

    expect(reuse.statusCode).toBe(401);
    expect(afterReuse.statusCode).toBe(401);
  });

  it('returns 401 without a cookie', async () => {
    const res = await refresh();

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 and clears the cookie for a malformed token', async () => {
    const res = await refresh('shoppy_refresh=garbage');

    expect(res.statusCode).toBe(401);
    expect(String(res.headers['set-cookie'])).toMatch(/shoppy_refresh=;/);
  });

  it('returns 401 for an expired session', async () => {
    const user = await registerUser(app);
    await app.get(PrismaService).sessionFamily.updateMany({
      where: { userId: user.user.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const res = await refresh(user.refreshCookie);

    expect(res.statusCode).toBe(401);
  });

  it('does not revoke the session for a forged token that only knows the session id', async () => {
    const user = await registerUser(app);
    const sessionId = user.refreshCookie.split('=')[1]?.split('.')[0];

    const forged = await refresh(`shoppy_refresh=${sessionId}.forged.signature`);

    expect(forged.statusCode).toBe(401);
    expect((await refresh(user.refreshCookie)).statusCode).toBe(200);
  });

  it('returns 403 for a request from another site', async () => {
    const user = await registerUser(app);

    const res = await refresh(user.refreshCookie, { 'sec-fetch-site': 'same-site' });

    expect(res.statusCode).toBe(403);
  });
});
