import type { ListDto } from '@shoppy/shared';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import { buildList, LIST_ID, NO_RECENT_HISTORY } from '@/test/shopping-fixtures';

function list(overrides: Partial<ListDto>): ListDto {
  const { entries: _entries, ...summary } = buildList();
  return { ...summary, ...overrides };
}

describe('ListsPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the empty state', async () => {
    stubApi({ 'GET /api/scopes/personal/lists': () => Response.json([]) });

    renderApp('/lists');

    expect(await screen.findByText('No lists yet')).toBeInTheDocument();
  });

  it('keeps archived lists in a separate section', async () => {
    stubApi({
      'GET /api/scopes/personal/lists': () =>
        Response.json([
          list({ name: 'Weekly shop', entryCount: 3 }),
          list({ id: '01999d6c-6c4a-7c39-9a3f-000000000040', name: 'Party', isArchived: true }),
        ]),
    });

    renderApp('/lists');

    expect(await screen.findByText('3 entries')).toBeInTheDocument();
    expect(screen.getByText('Archived (1)')).toBeInTheDocument();
  });

  it('creates a list and opens it', async () => {
    const created = list({ name: 'Hardware', icon: 'wrench' });
    const fetchMock = stubApi({
      'GET /api/scopes/personal/lists': () => Response.json([]),
      'POST /api/scopes/personal/lists': () => Response.json(created, { status: 201 }),
      [`GET /api/lists/${LIST_ID}`]: () => Response.json(buildList([], { name: 'Hardware' })),
      [`GET /api/lists/${LIST_ID}/history/recent`]: () => Response.json(NO_RECENT_HISTORY),
      'GET /api/scopes/personal/categories': () => Response.json([]),
      'GET /api/scopes/personal/items': () => Response.json([]),
    });
    renderApp('/lists');

    await userEvent.click(await screen.findByRole('button', { name: 'New list' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Hardware');
    await userEvent.click(screen.getByRole('radio', { name: 'wrench' }));
    await userEvent.click(screen.getByRole('button', { name: 'Create list' }));

    expect(await screen.findByRole('heading', { name: 'Hardware' })).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(post?.[1]?.body as string)).toEqual({ name: 'Hardware', icon: 'wrench' });
  });
});
