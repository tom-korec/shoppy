import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { CATEGORIES_MAX_COUNT, DEFAULT_CATEGORIES } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { insertRows } from '../support/insert-rows.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs } from '../support/shopping-fixtures.js';

describe('POST /api/scopes/personal/categories', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds the category at the end', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('POST', '/scopes/personal/categories', {
      name: ' Pets ',
      icon: 'paw-print',
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      name: 'Pets',
      icon: 'paw-print',
      position: 8,
      itemCount: 0,
    });
  });

  it('returns 409 for a name that exists in any letter case', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('POST', '/scopes/personal/categories', {
      name: 'BAKERY',
      icon: 'croissant',
    });

    expect(res.statusCode).toBe(409);
  });

  it('allows the same name in another user scope', async () => {
    const api = apiAs(app, await registerUser(app));
    await apiAs(app, await registerUser(app))('POST', '/scopes/personal/categories', {
      name: 'Pets',
      icon: 'paw-print',
    });

    const res = await api('POST', '/scopes/personal/categories', {
      name: 'Pets',
      icon: 'paw-print',
    });

    expect(res.statusCode).toBe(201);
  });

  it('returns 400 for an icon outside the curated set', async () => {
    const api = apiAs(app, await registerUser(app));

    const res = await api('POST', '/scopes/personal/categories', { name: 'Pets', icon: 'skull' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 at the size limit', async () => {
    const user = await registerUser(app);
    await insertRows(app, 'categories', {
      ownerUserId: user.user.id,
      count: CATEGORIES_MAX_COUNT - DEFAULT_CATEGORIES.length,
    });

    const res = await apiAs(app, user)('POST', '/scopes/personal/categories', {
      name: 'One more',
      icon: 'tag',
    });

    expect(res.statusCode).toBe(409);
  });
});
