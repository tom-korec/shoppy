import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { sessionListSchema } from '@shoppy/shared';
import { bearer, registerUser, signInAgain } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';

describe('DELETE /api/me/sessions/:id', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const listSessions = (accessToken: string) =>
    app.inject({ method: 'GET', url: '/api/me/sessions', headers: bearer(accessToken) });

  const revoke = (accessToken: string | undefined, sessionId: string | undefined) =>
    app.inject({
      method: 'DELETE',
      url: `/api/me/sessions/${sessionId}`,
      headers: accessToken ? bearer(accessToken) : {},
    });

  it('signs that device out immediately and keeps the current one', async () => {
    const user = await registerUser(app);
    const second = await signInAgain(app, user.email);
    const sessions = sessionListSchema.parse((await listSessions(user.accessToken)).json());

    const res = await revoke(user.accessToken, sessions.find((session) => !session.isCurrent)?.id);

    expect(res.statusCode).toBe(204);
    expect((await listSessions(second.accessToken)).statusCode).toBe(401);
    expect((await listSessions(user.accessToken)).statusCode).toBe(200);
  });

  it("returns 404 for another user's session", async () => {
    const user = await registerUser(app);
    const other = await registerUser(app);
    const [otherSession] = sessionListSchema.parse((await listSessions(other.accessToken)).json());

    const res = await revoke(user.accessToken, otherSession?.id);

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const user = await registerUser(app);

    const res = await revoke(user.accessToken, 'not-a-uuid');

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 without an access token', async () => {
    const res = await revoke(undefined, '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b');

    expect(res.statusCode).toBe(401);
  });
});
