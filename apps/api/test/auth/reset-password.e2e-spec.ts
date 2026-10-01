import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';

const NEW_PASSWORD = 'Brandnew42';

describe('POST /api/auth/reset-password', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const requestLink = (email: string) =>
    app.inject({ method: 'POST', url: '/api/auth/forgot-password', payload: { email } });

  const reset = (token: string | null, password = NEW_PASSWORD) =>
    app.inject({ method: 'POST', url: '/api/auth/reset-password', payload: { token, password } });

  const login = (email: string, password: string) =>
    app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });

  it('sets the new password with the emailed link', async () => {
    const user = await registerUser(app);
    await requestLink(user.email);
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    const res = await reset(token);

    expect(res.statusCode).toBe(204);
    expect((await login(user.email, NEW_PASSWORD)).statusCode).toBe(200);
  });

  it('signs out every existing session', async () => {
    const user = await registerUser(app);
    await requestLink(user.email);
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    await reset(token);

    const refresh = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: { cookie: user.refreshCookie },
    });
    expect(refresh.statusCode).toBe(401);
  });

  it('verifies the email of an unverified account', async () => {
    const user = await registerUser(app, { isVerified: false });
    await requestLink(user.email);
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    await reset(token);

    const session = await login(user.email, NEW_PASSWORD);
    expect(session.json()).toMatchObject({ user: { isEmailVerified: true } });
  });

  it('rejects a weak new password', async () => {
    const user = await registerUser(app);
    await requestLink(user.email);
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    const res = await reset(token, 'weak');

    expect(res.statusCode).toBe(400);
  });

  it('rejects a used link', async () => {
    const user = await registerUser(app);
    await requestLink(user.email);
    const token = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');
    await reset(token);

    const res = await reset(token, 'Another123');

    expect(res.statusCode).toBe(400);
  });
});
