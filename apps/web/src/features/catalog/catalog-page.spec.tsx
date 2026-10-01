import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import { buildCategory, buildItem } from '@/test/shopping-fixtures';

describe('CatalogPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('searches the catalog', async () => {
    stubApi({
      'GET /api/scopes/personal/categories': () => Response.json([buildCategory()]),
      'GET /api/scopes/personal/items': () =>
        Response.json([
          buildItem(),
          buildItem({
            id: '01999d6c-6c4a-7c39-9a3f-000000000005',
            name: 'Bread',
            categoryId: null,
          }),
        ]),
    });
    renderApp('/catalog');
    await screen.findByText('Bread');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search the catalog' }), 'mil');

    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('shows an empty catalog', async () => {
    stubApi({
      'GET /api/scopes/personal/categories': () => Response.json([]),
      'GET /api/scopes/personal/items': () => Response.json([]),
    });

    renderApp('/catalog');

    expect(await screen.findByText('Your catalog is empty')).toBeInTheDocument();
  });
});
