import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { authSessionSchema } from '@shoppy/shared';
import { randomUUID } from 'node:crypto';
import type { GoogleProfile } from '../../src/features/auth/google-id-token-verifier.service.js';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import {
  readRefreshCookie,
  registerUser,
  TEST_PASSWORD,
  uniqueEmail,
} from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

function googleProfile(overrides: Partial<GoogleProfile> = {}): GoogleProfile {
  return {
    googleUserId: randomUUID(),
    email: uniqueEmail(),
    isEmailVerified: true,
    name: 'Anna Google',
    ...overrides,
  };
}

describe('POST /api/auth/google', () => {
  let app: NestFastifyApplication;
  let profile: GoogleProfile;

  beforeEach(async () => {
    profile = googleProfile();
    app = await createTestApp({ googleVerifier: { verify: () => Promise.resolve(profile) } });
  });

  afterEach(async () => {
    await app.close();
  });

  const signIn = () =>
    app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'google-id-token' },
    });

  it('creates a verified account with the Google name', async () => {
    const res = await signIn();

    expect(res.statusCode).toBe(200);
    expect(authSessionSchema.parse(res.json()).user).toMatchObject({
      email: profile.email,
      displayName: 'Anna Google',
      isEmailVerified: true,
      hasPassword: false,
      hasGoogle: true,
    });
    expect(readRefreshCookie(res)).toBeDefined();
  });

  it('signs in to the same account the second time', async () => {
    const first = authSessionSchema.parse((await signIn()).json());

    const second = authSessionSchema.parse((await signIn()).json());

    expect(second.user.id).toBe(first.user.id);
  });

  it('links Google to an existing verified account and keeps its password', async () => {
    const existing = await registerUser(app);
    profile = googleProfile({ email: existing.email });

    const res = await signIn();

    expect(authSessionSchema.parse(res.json()).user).toMatchObject({
      id: existing.user.id,
      hasPassword: true,
      hasGoogle: true,
    });
  });

  it('removes the password and sessions of an unverified account it takes over', async () => {
    const squatter = await registerUser(app, { isVerified: false });
    profile = googleProfile({ email: squatter.email });

    const res = await signIn();

    expect(authSessionSchema.parse(res.json()).user).toMatchObject({
      id: squatter.user.id,
      isEmailVerified: true,
      hasPassword: false,
    });
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: squatter.email, password: TEST_PASSWORD },
    });
    expect(login.statusCode).toBe(401);
    const refresh = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: { cookie: squatter.refreshCookie },
    });
    expect(refresh.statusCode).toBe(401);
  });

  it('returns 400 without an ID token', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/google', payload: {} });

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 when Google has not verified the email', async () => {
    profile = googleProfile({ isEmailVerified: false });

    const res = await signIn();

    expect(res.statusCode).toBe(401);
    expect(
      await app.get(PrismaService).user.findUnique({ where: { email: profile.email } }),
    ).toBeNull();
  });
});

describe('POST /api/auth/google without configuration', () => {
  it('returns 503 when no Google client ID is set', async () => {
    const app = await createTestApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'google-id-token' },
    });

    expect(res.statusCode).toBe(503);
    await app.close();
  });
});
