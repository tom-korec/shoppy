import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LISTS_MAX_COUNT } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { insertRows } from '../support/insert-rows.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('POST /api/scopes/personal/lists', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an empty list', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('POST', '/scopes/personal/lists', {
      name: ' Weekly shop ',
      icon: 'store',
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      name: 'Weekly shop',
      icon: 'store',
      isArchived: false,
      entryCount: 0,
    });
  });

  it('returns 400 without a name', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('POST', '/scopes/personal/lists', { icon: 'store' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 at the size limit', async () => {
    const user = await registerUser(app);
    await insertRows(app, 'lists', { ownerUserId: user.user.id, count: LISTS_MAX_COUNT });

    const res = await apiAs(app, user)('POST', '/scopes/personal/lists', {
      name: 'One more',
      icon: 'store',
    });

    expect(res.statusCode).toBe(409);
  });
});
