import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bearer, registerUser, signInAgain } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('DELETE /api/me/sessions', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const getMe = (accessToken: string) =>
    app.inject({ method: 'GET', url: '/api/me', headers: bearer(accessToken) });

  it('signs out every session, including the current one', async () => {
    const user = await registerUser(app);
    const second = await signInAgain(app, user.email);

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/me/sessions',
      headers: bearer(user.accessToken),
    });

    expect(res.statusCode).toBe(204);
    expect((await getMe(user.accessToken)).statusCode).toBe(401);
    expect((await getMe(second.accessToken)).statusCode).toBe(401);
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/me/sessions' });

    expect(res.statusCode).toBe(401);
  });
});
