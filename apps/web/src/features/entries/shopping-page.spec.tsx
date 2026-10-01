import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import { buildEntry, buildList, LIST_ID, NO_RECENT_HISTORY } from '@/test/shopping-fixtures';

const entry = buildEntry({ name: 'Coffee' });

describe('ShoppingPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('strikes an entry through and finishes the trip', async () => {
    let current = entry;
    const fetchMock = stubApi({
      [`GET /api/lists/${LIST_ID}`]: () => Response.json(buildList([current])),
      [`GET /api/lists/${LIST_ID}/history/recent`]: () => Response.json(NO_RECENT_HISTORY),
      'GET /api/scopes/personal/categories': () => Response.json([]),
      'GET /api/scopes/personal/items': () => Response.json([]),
      [`PATCH /api/entries/${entry.id}`]: () => {
        current = { ...entry, isChecked: true };
        return Response.json(current);
      },
      [`POST /api/lists/${LIST_ID}/finish-shopping`]: () => Response.json({ count: 1 }),
    });
    renderApp(`/lists/${LIST_ID}/shop`);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Coffee' }));
    await userEvent.click(screen.getByRole('button', { name: 'Finish · move 1 to history' }));

    const requests = fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${url}`);
    expect(requests).toContain(`PATCH /api/entries/${entry.id}`);
    expect(requests).toContain(`POST /api/lists/${LIST_ID}/finish-shopping`);
  });
});
