import { purchaseRecordSchema } from '@shoppy/shared';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import {
  buildCategory,
  buildEntry,
  buildItem,
  buildList,
  DAIRY_ID,
  LIST_ID,
  NO_RECENT_HISTORY,
} from '@/test/shopping-fixtures';

const milkEntry = buildEntry({
  id: '01999d6c-6c4a-7c39-9a3f-000000000010',
  itemId: buildItem().id,
  name: 'Milk',
  note: '2 l',
  categoryId: DAIRY_ID,
});
const candlesEntry = buildEntry();

const candlesRecord = purchaseRecordSchema.parse({
  id: '01999d6c-6c4a-7c39-9a3f-000000000020',
  listId: LIST_ID,
  itemId: null,
  name: 'Candles',
  categoryName: null,
  note: null,
  boughtBy: null,
  boughtAt: '2026-10-01T12:00:00.000Z',
});

let entries = [milkEntry, candlesEntry];

// A touch swipe along a row by `dx` pixels.
function swipe(row: HTMLElement, dx: number) {
  const touch = { pointerType: 'touch', clientY: 10 };
  fireEvent.pointerDown(row, { ...touch, clientX: 150 });
  fireEvent.pointerMove(row, { ...touch, clientX: 150 + dx });
  fireEvent.pointerUp(row, { ...touch, clientX: 150 + dx });
}

function stubList(extra: Parameters<typeof stubApi>[0] = {}) {
  entries = [milkEntry, candlesEntry];
  return stubApi({
    [`GET /api/lists/${LIST_ID}`]: () => Response.json(buildList(entries)),
    [`GET /api/lists/${LIST_ID}/history/recent`]: () => Response.json(NO_RECENT_HISTORY),
    [`POST /api/lists/${LIST_ID}/visits`]: () => new Response(null, { status: 204 }),
    'GET /api/scopes/personal/categories': () => Response.json([buildCategory()]),
    'GET /api/scopes/personal/items': () => Response.json([buildItem()]),
    ...extra,
  });
}

describe('ListPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('groups entries by category with uncategorized ones first', async () => {
    stubList();

    renderApp(`/lists/${LIST_ID}`);

    await screen.findByRole('region', { name: 'Dairy & eggs' });
    const groups = screen.getAllByRole('region');
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      'No category',
      'Dairy & eggs',
    ]);
    expect(within(groups[1] as HTMLElement).getByText('2 l')).toBeInTheDocument();
  });

  it('adds a catalog item with the note typed after a comma', async () => {
    const fetchMock = stubList({
      [`POST /api/lists/${LIST_ID}/entries`]: (init) =>
        Response.json(
          { ...milkEntry, ...(JSON.parse(init?.body as string) as object) },
          { status: 201 },
        ),
    });
    renderApp(`/lists/${LIST_ID}`);

    await userEvent.type(await screen.findByLabelText('Add to list'), 'milk, 1 l{Enter}');

    const post = fetchMock.mock.calls.find(([url]) => url === `/api/lists/${LIST_ID}/entries`);
    expect(JSON.parse(post?.[1]?.body as string)).toMatchObject({
      itemId: buildItem().id,
      note: '1 l',
    });
    expect(screen.getByLabelText('Add to list')).toHaveValue('');
  });

  it('stars the list', async () => {
    let isFavorite = false;
    const fetchMock = stubList({
      [`GET /api/lists/${LIST_ID}`]: () => Response.json(buildList(entries, { isFavorite })),
      'POST /api/me/favorites': () => {
        isFavorite = true;
        return new Response(null, { status: 204 });
      },
    });
    renderApp(`/lists/${LIST_ID}`);

    const star = await screen.findByRole('button', { name: 'Favorite' });
    await userEvent.click(star);

    await waitFor(() => expect(star).toHaveAttribute('aria-pressed', 'true'));
    const post = fetchMock.mock.calls.find(([url]) => url === '/api/me/favorites');
    expect(JSON.parse(post?.[1]?.body as string)).toEqual({ listId: LIST_ID });
  });

  it('deletes an entry swiped to the left and offers to undo it', async () => {
    stubList({
      [`DELETE /api/entries/${candlesEntry.id}`]: () => {
        entries = [milkEntry];
        return new Response(null, { status: 204 });
      },
    });
    renderApp(`/lists/${LIST_ID}`);

    swipe(await screen.findByRole('button', { name: 'Candles' }), -200);

    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Candles' })).not.toBeInTheDocument();
  });

  it('checks an entry swiped to the right', async () => {
    const fetchMock = stubList({
      [`POST /api/entries/${candlesEntry.id}/check`]: () => {
        entries = [milkEntry];
        return Response.json(candlesRecord);
      },
    });
    renderApp(`/lists/${LIST_ID}`);

    swipe(await screen.findByRole('button', { name: 'Candles' }), 200);

    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/entries/${candlesEntry.id}/check`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('puts the star back when starring fails', async () => {
    stubList({
      'POST /api/me/favorites': () => Response.json({ message: 'Down' }, { status: 500 }),
    });
    renderApp(`/lists/${LIST_ID}`);

    const star = await screen.findByRole('button', { name: 'Favorite' });
    await userEvent.click(star);

    expect(await screen.findByText(/Couldn't update favorites/)).toBeInTheDocument();
    expect(star).toHaveAttribute('aria-pressed', 'false');
  });

  it('checks an entry off and offers to undo it', async () => {
    stubList({
      [`POST /api/entries/${candlesEntry.id}/check`]: () => {
        entries = [milkEntry];
        return Response.json(candlesRecord);
      },
    });
    renderApp(`/lists/${LIST_ID}`);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Bought Candles' }));

    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Bought Candles' })).not.toBeInTheDocument();
  });

  it('shows an archived list read-only', async () => {
    stubApi({
      [`GET /api/lists/${LIST_ID}`]: () =>
        Response.json(buildList([candlesEntry], { isArchived: true })),
      [`GET /api/lists/${LIST_ID}/history/recent`]: () => Response.json(NO_RECENT_HISTORY),
      'GET /api/scopes/personal/categories': () => Response.json([]),
      'GET /api/scopes/personal/items': () => Response.json([]),
    });

    renderApp(`/lists/${LIST_ID}`);

    expect(await screen.findByText('This list is archived and read-only.')).toBeInTheDocument();
    expect(screen.getByText('Candles')).toBeInTheDocument();
    expect(screen.queryByLabelText('Add to list')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('takes back an entry the server refused and says why', async () => {
    stubList({
      [`POST /api/lists/${LIST_ID}/entries`]: () =>
        Response.json({ message: 'A list can hold at most 500 entries' }, { status: 409 }),
    });
    renderApp(`/lists/${LIST_ID}`);

    await userEvent.type(await screen.findByLabelText('Add to list'), 'Soap{Enter}');

    expect(
      await screen.findByText("Couldn't add Soap: A list can hold at most 500 entries"),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Bought Soap' })).not.toBeInTheDocument();
  });
});
