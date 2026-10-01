import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { apiAs, createList } from '../support/shopping-fixtures.js';

describe('PATCH /api/lists/:id', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('renames and re-icons the list', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('PATCH', `/lists/${list.id}`, {
      name: 'Saturday',
      icon: 'sun',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ name: 'Saturday', icon: 'sun' });
  });

  it('archives and unarchives the list', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const list = await createList(app, user);

    const archived = await api('PATCH', `/lists/${list.id}`, { isArchived: true });
    const unarchived = await api('PATCH', `/lists/${list.id}`, { isArchived: false });

    expect(archived.json()).toMatchObject({ isArchived: true });
    expect(unarchived.json()).toMatchObject({ isArchived: false });
  });

  it('returns 400 for an unknown icon', async () => {
    const user = await registerUser(app);
    const list = await createList(app, user);

    const res = await apiAs(app, user)('PATCH', `/lists/${list.id}`, { icon: 'nope' });

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for another user's list", async () => {
    const list = await createList(app, await registerUser(app));

    const res = await apiAs(app, await registerUser(app))('PATCH', `/lists/${list.id}`, {
      isArchived: true,
    });

    expect(res.statusCode).toBe(404);
  });
});
