import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { authSessionSchema } from '@shoppy/shared';
import {
  readRefreshCookie,
  registerUser,
  TEST_PASSWORD,
  uniqueEmail,
} from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('POST /api/auth/login', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const login = (email: string, password: string) =>
    app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });

  it('signs in with the right password and sets the refresh cookie', async () => {
    const { email } = await registerUser(app);

    const res = await login(email.toUpperCase(), TEST_PASSWORD);

    expect(res.statusCode).toBe(200);
    expect(authSessionSchema.parse(res.json()).user.email).toBe(email);
    expect(readRefreshCookie(res)).toBeDefined();
  });

  it('returns 401 for a wrong password', async () => {
    const { email } = await registerUser(app);

    const res = await login(email, 'Wrong1234');

    expect(res.statusCode).toBe(401);
  });

  it('returns the same 401 for an unknown email', async () => {
    const res = await login(uniqueEmail(), TEST_PASSWORD);

    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ message: 'Wrong email or password' });
  });

  it('returns 400 for an empty password', async () => {
    const res = await login(uniqueEmail(), '');

    expect(res.statusCode).toBe(400);
  });

  it('returns 429 after too many attempts for one email', async () => {
    const email = uniqueEmail();
    for (let attempt = 0; attempt < 10; attempt += 1) await login(email, 'Wrong1234');

    const res = await login(email, 'Wrong1234');

    expect(res.statusCode).toBe(429);
  });
});
