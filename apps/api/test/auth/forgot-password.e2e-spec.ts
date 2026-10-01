import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser, uniqueEmail } from '../support/auth-fixtures.js';
import { createTestApp, sentEmails } from '../support/create-test-app.js';

describe('POST /api/auth/forgot-password', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const requestLink = (email: string) =>
    app.inject({ method: 'POST', url: '/api/auth/forgot-password', payload: { email } });

  it('emails a reset link to an existing account', async () => {
    const user = await registerUser(app);

    const res = await requestLink(user.email);

    expect(res.statusCode).toBe(204);
    const link = sentEmails(app).lastLinkTo(user.email);
    expect(link.origin + link.pathname).toBe('https://shoppy.test/reset-password');
  });

  it('answers 204 for an unknown email without sending anything', async () => {
    const email = uniqueEmail();

    const res = await requestLink(email);

    expect(res.statusCode).toBe(204);
    expect(sentEmails(app).sent.filter((message) => message.to === email)).toHaveLength(0);
  });

  it('answers 204 even when sending fails', async () => {
    const user = await registerUser(app);
    vi.spyOn(sentEmails(app), 'send').mockRejectedValueOnce(new Error('Resend down'));

    const res = await requestLink(user.email);

    expect(res.statusCode).toBe(204);
  });

  it('returns 400 for an invalid email', async () => {
    const res = await requestLink('not-an-email');

    expect(res.statusCode).toBe(400);
  });

  it('returns 429 after three links for one address within an hour', async () => {
    const email = uniqueEmail();
    for (let attempt = 0; attempt < 3; attempt += 1) await requestLink(email);

    const res = await requestLink(email);

    expect(res.statusCode).toBe(429);
  });
});
