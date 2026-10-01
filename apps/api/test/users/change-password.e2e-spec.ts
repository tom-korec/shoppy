import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';
import { bearer, registerUser, signInAgain, TEST_PASSWORD } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('POST /api/me/password', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const changePassword = (
    accessToken: string | undefined,
    currentPassword: string,
    newPassword = 'Changed123',
  ) =>
    app.inject({
      method: 'POST',
      url: '/api/me/password',
      headers: accessToken ? bearer(accessToken) : {},
      payload: { currentPassword, newPassword },
    });

  const getMe = (accessToken: string) =>
    app.inject({ method: 'GET', url: '/api/me', headers: bearer(accessToken) });

  it('changes the password and signs out the other devices only', async () => {
    const user = await registerUser(app);
    const other = await signInAgain(app, user.email);

    const res = await changePassword(user.accessToken, TEST_PASSWORD);

    expect(res.statusCode).toBe(204);
    expect((await getMe(user.accessToken)).statusCode).toBe(200);
    expect((await getMe(other.accessToken)).statusCode).toBe(401);
  });

  it('returns 400 when the current password is wrong', async () => {
    const user = await registerUser(app);

    const res = await changePassword(user.accessToken, 'Wrong1234');

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a weak new password', async () => {
    const user = await registerUser(app);

    const res = await changePassword(user.accessToken, TEST_PASSWORD, 'weak');

    expect(res.statusCode).toBe(400);
  });

  it('returns 400 for a Google-only account, which has no password yet', async () => {
    const googleApp = await createTestApp({
      googleVerifier: {
        verify: () =>
          Promise.resolve({
            googleUserId: randomUUID(),
            email: `google-${randomUUID()}@example.com`,
            isEmailVerified: true,
            name: 'Anna',
          }),
      },
    });
    const signIn = await googleApp.inject({
      method: 'POST',
      url: '/api/auth/google',
      payload: { idToken: 'google-id-token' },
    });

    const res = await googleApp.inject({
      method: 'POST',
      url: '/api/me/password',
      headers: bearer(String(signIn.json().accessToken)),
      payload: { currentPassword: TEST_PASSWORD, newPassword: 'Changed123' },
    });

    expect(res.statusCode).toBe(400);
    await googleApp.close();
  });

  it('returns 401 without an access token', async () => {
    const res = await changePassword(undefined, TEST_PASSWORD);

    expect(res.statusCode).toBe(401);
  });
});
