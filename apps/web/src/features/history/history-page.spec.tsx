import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import { buildEntry, buildList, buildRecord, LIST_ID } from '@/test/shopping-fixtures';

const bread = buildRecord();
const eggs = buildRecord({ id: '01999d6c-6c4a-7c39-9a3f-000000000031', name: 'Eggs' });

let records = [bread, eggs];

function stubHistory(extra: Parameters<typeof stubApi>[0] = {}, isArchived = false) {
  records = [bread, eggs];
  return stubApi({
    [`GET /api/lists/${LIST_ID}`]: () => Response.json(buildList([], { isArchived })),
    [`GET /api/lists/${LIST_ID}/history`]: () => Response.json({ records, nextCursor: 'next' }),
    [`GET /api/lists/${LIST_ID}/history?cursor=next`]: () =>
      Response.json({
        records: [buildRecord({ id: '01999d6c-6c4a-7c39-9a3f-000000000032', name: 'Tea' })],
        nextCursor: null,
      }),
    'GET /api/scopes/personal/categories': () => Response.json([]),
    'GET /api/scopes/personal/items': () => Response.json([]),
    ...extra,
  });
}

describe('HistoryPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads more records on request', async () => {
    stubHistory();
    renderApp(`/lists/${LIST_ID}/history`);

    await userEvent.click(await screen.findByRole('button', { name: 'Show more' }));

    expect(await screen.findByText('Tea')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
  });

  it('puts a record back on the list', async () => {
    const fetchMock = stubHistory({
      [`POST /api/history/${bread.id}/restore`]: () => {
        records = [eggs];
        return Response.json(buildEntry({ name: 'Bread' }));
      },
    });
    renderApp(`/lists/${LIST_ID}/history`);

    await userEvent.click(await screen.findByRole('button', { name: /Bread/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Put back on the list' }));

    await waitFor(() => expect(screen.queryByText('Bread')).not.toBeInTheDocument());
    const restore = fetchMock.mock.calls.find(([url]) => url.endsWith('/restore'));
    expect(JSON.parse(restore?.[1]?.body as string)).toHaveProperty('entryId');
  });

  it('deletes selected records in one go', async () => {
    const fetchMock = stubHistory({
      [`POST /api/lists/${LIST_ID}/history/bulk`]: () => Response.json({ count: 2 }),
    });
    renderApp(`/lists/${LIST_ID}/history`);

    await userEvent.click(await screen.findByRole('button', { name: 'Select records' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Bread' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Eggs' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete selected' }));

    const bulk = fetchMock.mock.calls.find(([url]) => url.endsWith('/history/bulk'));
    expect(JSON.parse(bulk?.[1]?.body as string)).toEqual({
      action: 'delete',
      ids: [bread.id, eggs.id],
    });
  });

  it('offers no actions on an archived list', async () => {
    stubHistory({}, true);
    renderApp(`/lists/${LIST_ID}/history`);

    expect(await screen.findByText('Bread')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select records' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bread/ })).not.toBeInTheDocument();
  });
});
