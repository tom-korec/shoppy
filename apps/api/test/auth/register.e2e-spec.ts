import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { authSessionSchema, DEFAULT_CATEGORIES } from '@shoppy/shared';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import { readRefreshCookie, TEST_PASSWORD, uniqueEmail } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';

describe('POST /api/auth/register', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const register = (payload: Record<string, unknown>) =>
    app.inject({ method: 'POST', url: '/api/auth/register', payload });

  it('creates an unverified account and signs it in', async () => {
    const email = uniqueEmail();

    const res = await register({ displayName: 'Anna', email, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(201);
    const session = authSessionSchema.parse(res.json());
    expect(session.user).toMatchObject({
      email,
      displayName: 'Anna',
      isEmailVerified: false,
      hasPassword: true,
      hasGoogle: false,
    });
  });

  it('sets the refresh cookie as HttpOnly, Secure, SameSite=Strict on /api/auth', async () => {
    const res = await register({
      displayName: 'Anna',
      email: uniqueEmail(),
      password: TEST_PASSWORD,
    });

    const header = String(res.headers['set-cookie']);
    expect(header).toMatch(/^shoppy_refresh=/);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('Secure');
    expect(header).toContain('SameSite=Strict');
    expect(header).toContain('Path=/api/auth');
  });

  it('sends a verification link', async () => {
    const email = uniqueEmail();

    await register({ displayName: 'Anna', email, password: TEST_PASSWORD });

    const link = sentEmails(app).lastLinkTo(email);
    expect(link.origin + link.pathname).toBe('https://shoppy.test/verify-email');
    expect(link.searchParams.get('token')).toBeTruthy();
  });

  it('seeds the default categories in order', async () => {
    const res = await register({
      displayName: 'Anna',
      email: uniqueEmail(),
      password: TEST_PASSWORD,
    });

    const categories = await app.get(PrismaService).category.findMany({
      where: { ownerUserId: authSessionSchema.parse(res.json()).user.id },
      orderBy: { position: 'asc' },
    });
    expect(categories.map(({ name, icon }) => ({ name, icon }))).toEqual(DEFAULT_CATEGORIES);
  });

  it('returns 409 when the email is taken, ignoring case', async () => {
    const email = uniqueEmail();
    await register({ displayName: 'Anna', email, password: TEST_PASSWORD });

    const res = await register({
      displayName: 'Other',
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    expect(res.statusCode).toBe(409);
  });

  it('returns 400 for a password without an uppercase letter', async () => {
    const res = await register({
      displayName: 'Anna',
      email: uniqueEmail(),
      password: 'secret123',
    });

    expect(res.statusCode).toBe(400);
    expect(readRefreshCookie(res)).toBeUndefined();
  });

  it('returns 400 without a display name', async () => {
    const res = await register({ displayName: ' ', email: uniqueEmail(), password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
  });

  it('returns 429 after ten registrations from one IP within an hour', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await register({ displayName: 'Anna', email: uniqueEmail(), password: TEST_PASSWORD });
    }

    const res = await register({
      displayName: 'Anna',
      email: uniqueEmail(),
      password: TEST_PASSWORD,
    });

    expect(res.statusCode).toBe(429);
  });
});
