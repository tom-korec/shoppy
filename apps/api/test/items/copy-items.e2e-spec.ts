import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { categoryListSchema, itemListSchema, itemSchema } from '@shoppy/shared';
import { registerUser } from '../support/auth-fixtures.js';
import { createTestApp } from '../support/create-test-app.js';
import { addMember, createHousehold } from '../support/household-fixtures.js';
import { apiAs, createItem, listCategories, parseOk } from '../support/shopping-fixtures.js';

describe('POST /api/items/copy', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('copies personal items into a household, matching categories by name', async () => {
    const user = await registerUser(app);
    const api = apiAs(app, user);
    const household = await createHousehold(app, user);
    const [, bakery] = await listCategories(app, user);
    const bread = await createItem(app, user, { name: 'Rye bread', categoryId: bakery?.id });

    const res = await api('POST', '/items/copy', {
      target: { kind: 'household', householdId: household.id },
      itemIds: [bread.id],
    });

    expect(res.json()).toEqual({ copied: 1, skipped: [] });
    const items = parseOk(
      await api('GET', `/scopes/households/${household.id}/items`),
      itemListSchema,
    );
    const categories = parseOk(
      await api('GET', `/scopes/households/${household.id}/categories`),
      categoryListSchema,
    );
    expect(items[0]?.categoryId).toBe(categories.find(({ name }) => name === 'Bakery')?.id);
  });

  it('skips items whose name already exists in the target', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    await apiAs(app, owner)('POST', `/scopes/households/${household.id}/items`, { name: 'milk' });
    const milk = await createItem(app, owner, { name: 'Milk' });

    const res = await apiAs(app, owner)('POST', '/items/copy', {
      target: { kind: 'household', householdId: household.id },
      itemIds: [milk.id],
    });

    expect(res.json()).toEqual({ copied: 0, skipped: ['Milk'] });
  });

  it('creates a missing category where allowed, and leaves it empty where not', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const member = await addMember(app, owner, household.id, 'MEMBER');
    const pets = parseOk(
      await apiAs(app, member)('POST', '/scopes/personal/categories', {
        name: 'Pets',
        icon: 'paw-print',
      }),
      categoryListSchema.element,
    );
    const food = await createItem(app, member, { name: 'Cat food', categoryId: pets.id });

    await apiAs(app, member)('POST', '/items/copy', {
      target: { kind: 'household', householdId: household.id },
      itemIds: [food.id],
    });

    const items = parseOk(
      await apiAs(app, member)('GET', `/scopes/households/${household.id}/items`),
      itemListSchema,
    );
    expect(items).toEqual([expect.objectContaining({ name: 'Cat food', categoryId: null })]);
  });

  it('copies household items into the personal catalog for any member', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const viewer = await addMember(app, owner, household.id, 'VIEWER');
    const item = parseOk(
      await apiAs(app, owner)('POST', `/scopes/households/${household.id}/items`, { name: 'Tea' }),
      itemSchema,
    );

    const res = await apiAs(app, viewer)('POST', '/items/copy', {
      target: { kind: 'personal' },
      itemIds: [item.id],
    });

    expect(res.json()).toEqual({ copied: 1, skipped: [] });
  });

  it('returns 403 when a Viewer copies into the household', async () => {
    const owner = await registerUser(app);
    const household = await createHousehold(app, owner);
    const viewer = await addMember(app, owner, household.id, 'VIEWER');
    const tea = await createItem(app, viewer, { name: 'Tea' });

    const res = await apiAs(app, viewer)('POST', '/items/copy', {
      target: { kind: 'household', householdId: household.id },
      itemIds: [tea.id],
    });

    expect(res.statusCode).toBe(403);
  });

  it("returns 404 for another user's item", async () => {
    const othersItem = await createItem(app, await registerUser(app), { name: 'Secret' });

    const res = await apiAs(app, await registerUser(app))('POST', '/items/copy', {
      target: { kind: 'personal' },
      itemIds: [othersItem.id],
    });

    expect(res.statusCode).toBe(404);
  });
});
