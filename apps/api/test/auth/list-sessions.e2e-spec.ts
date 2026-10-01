import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { sessionListSchema } from '@shoppy/shared';
import { bearer, registerUser, signInAgain } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('GET /api/me/sessions', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists active sessions and marks the current one', async () => {
    const user = await registerUser(app);
    const second = await signInAgain(app, user.email, 'Second device');

    const res = await app.inject({
      method: 'GET',
      url: '/api/me/sessions',
      headers: bearer(second.accessToken),
    });

    expect(res.statusCode).toBe(200);
    const sessions = sessionListSchema.parse(res.json());
    expect(sessions).toHaveLength(2);
    expect(sessions.find((session) => session.isCurrent)?.userAgent).toBe('Second device');
  });

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/me/sessions' });

    expect(res.statusCode).toBe(401);
  });
});
