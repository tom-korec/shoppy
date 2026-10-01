import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bearer, registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('PATCH /api/me', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const updateMe = (accessToken: string | undefined, displayName: string) =>
    app.inject({
      method: 'PATCH',
      url: '/api/me',
      headers: accessToken ? bearer(accessToken) : {},
      payload: { displayName },
    });

  it('updates the trimmed display name', async () => {
    const user = await registerUser(app);

    const res = await updateMe(user.accessToken, '  Anna K.  ');

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ displayName: 'Anna K.' });
  });

  it('returns 400 for an empty display name', async () => {
    const user = await registerUser(app);

    const res = await updateMe(user.accessToken, '');

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 without an access token', async () => {
    const res = await updateMe(undefined, 'Anna');

    expect(res.statusCode).toBe(401);
  });
});
