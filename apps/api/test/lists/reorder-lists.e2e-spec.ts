import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createList } from '../support/shopping-fixtures.js';

describe('PUT /api/me/list-view/order', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('saves a custom order and drops lists the user cannot see', async () => {
    const user = await registerUser(app);
    const first = await createList(app, user, { name: 'A', icon: 'store' });
    const second = await createList(app, user, { name: 'B', icon: 'store' });
    const foreign = await createList(app, await registerUser(app));

    const res = await apiAs(app, user)('PUT', '/me/list-view/order', {
      ids: [second.id, foreign.id, first.id],
    });

    expect(res.json()).toMatchObject({ customOrder: [second.id, first.id] });
  });
});
