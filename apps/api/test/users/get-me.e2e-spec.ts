import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { userSchema } from '@shoppy/shared';
import { bearer, registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('GET /api/me', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns the signed-in user', async () => {
    const user = await registerUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: bearer(user.accessToken),
    });

    expect(res.statusCode).toBe(200);
    expect(userSchema.parse(res.json())).toMatchObject({ id: user.user.id, isEmailVerified: true });
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/me' });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 for a forged access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/me', headers: bearer('a.b.c') });

    expect(res.statusCode).toBe(401);
  });
});
