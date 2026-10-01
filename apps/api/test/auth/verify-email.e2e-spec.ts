import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { EMAIL_NOT_VERIFIED } from '@shoppy/shared';
import { bearer, registerUser } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';

describe('POST /api/auth/verify-email', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const verify = (token: string | null) =>
    app.inject({ method: 'POST', url: '/api/auth/verify-email', payload: { token } });

  const getMe = (accessToken: string) =>
    app.inject({ method: 'GET', url: '/api/me', headers: bearer(accessToken) });

  it('blocks an unverified user from regular endpoints', async () => {
    const user = await registerUser(app, { isVerified: false });

    const res = await app.inject({
      method: 'PATCH',
      url: '/api/me',
      headers: bearer(user.accessToken),
      payload: { displayName: 'New' },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ code: EMAIL_NOT_VERIFIED });
  });

  it('still lets an unverified user read their profile', async () => {
    const user = await registerUser(app, { isVerified: false });

    const res = await getMe(user.accessToken);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ isEmailVerified: false });
  });

  it('verifies the email with the emailed link', async () => {
    const user = await registerUser(app, { isVerified: false });
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    const res = await verify(token);

    expect(res.statusCode).toBe(204);
    expect((await getMe(user.accessToken)).json()).toMatchObject({ isEmailVerified: true });
  });

  it('rejects a link that was already used', async () => {
    const user = await registerUser(app, { isVerified: false });
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');
    await verify(token);

    const res = await verify(token);

    expect(res.statusCode).toBe(400);
  });

  it('rejects an unknown token', async () => {
    const res = await verify('not-a-real-token');

    expect(res.statusCode).toBe(400);
  });
});
