import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bearer, registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('POST /api/auth/logout', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('ends the session so neither the cookie nor the access token work afterwards', async () => {
    const user = await registerUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie: user.refreshCookie },
    });

    expect(res.statusCode).toBe(204);
    const refresh = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      headers: { cookie: user.refreshCookie },
    });
    expect(refresh.statusCode).toBe(401);
    const me = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: bearer(user.accessToken),
    });
    expect(me.statusCode).toBe(401);
  });

  it('answers 204 without a cookie', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' });

    expect(res.statusCode).toBe(204);
  });
});
