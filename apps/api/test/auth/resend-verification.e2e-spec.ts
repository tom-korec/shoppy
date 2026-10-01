import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bearer, registerUser } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';

describe('POST /api/auth/resend-verification', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('sends a fresh link and invalidates the old one', async () => {
    const user = await registerUser(app, { isVerified: false });
    const oldToken = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/resend-verification',
      headers: bearer(user.accessToken),
    });

    expect(res.statusCode).toBe(204);
    const newToken = sentEmails(app).lastLinkTo(user.email).searchParams.get('token');
    expect(newToken).not.toBe(oldToken);
    const old = await app.inject({
      method: 'POST',
      url: '/api/auth/verify-email',
      payload: { token: oldToken },
    });
    expect(old.statusCode).toBe(400);
  });

  it('does nothing for an already verified user', async () => {
    const user = await registerUser(app);
    const sentBefore = sentEmails(app).sent.length;

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/resend-verification',
      headers: bearer(user.accessToken),
    });

    expect(res.statusCode).toBe(204);
    expect(sentEmails(app).sent).toHaveLength(sentBefore);
  });

  it('returns 401 when signed out', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/resend-verification' });

    expect(res.statusCode).toBe(401);
  });
});
