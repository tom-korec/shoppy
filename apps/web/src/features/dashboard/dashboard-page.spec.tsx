import { screen, within } from '@testing-library/react';
import { authStore } from '@/lib/auth-store';
import { buildUser, renderApp, stubApi } from '@/test/render-app';
import { buildListSummary } from '@/test/shopping-fixtures';

const weekly = buildListSummary({ id: '01999d6c-6c4a-7c39-9a3f-000000000101', name: 'Weekly' });
const party = buildListSummary({ id: '01999d6c-6c4a-7c39-9a3f-000000000102', name: 'Party' });
const hardware = buildListSummary({
  id: '01999d6c-6c4a-7c39-9a3f-000000000103',
  name: 'Hardware',
});

const invitation = {
  invitationId: '01999d6c-6c4a-7c39-9a3f-000000000201',
  householdId: '01999d6c-6c4a-7c39-9a3f-000000000202',
  householdName: 'Flat',
  role: 'MEMBER',
  invitedBy: 'Anna',
  expiresAt: '2026-12-01T12:00:00.000Z',
  isAlreadyMember: false,
};

function stubDashboard(dashboard: object, pendingInvitations: object[] = []) {
  return stubApi({
    'GET /api/me/dashboard': () => Response.json(dashboard),
    'GET /api/invitations/pending': () => Response.json(pendingInvitations),
    'GET /api/households': () => Response.json([]),
  });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    authStore.signIn({ accessToken: 'token', user: buildUser() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows favorites in order and recently used lists', async () => {
    stubDashboard({ favorites: [weekly, party], recent: [hardware] });

    renderApp('/');

    const favorites = await screen.findByRole('list', { name: 'Favorites' });
    expect(
      within(favorites)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([expect.stringContaining('Weekly'), expect.stringContaining('Party')]);
    const recent = screen.getByRole('list', { name: 'Recently used' });
    expect(within(recent).getByRole('link')).toHaveTextContent('Hardware');
    expect(screen.getByRole('button', { name: 'Arrange favorites' })).toBeInTheDocument();
  });

  it('explains how to add favorites when there are none', async () => {
    stubDashboard({ favorites: [], recent: [] });

    renderApp('/');

    expect(await screen.findByText('No favorite lists yet')).toBeInTheDocument();
    expect(screen.getByText('Other lists you open will show up here.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Arrange favorites' })).not.toBeInTheDocument();
  });

  it('shows pending invitations when there are some', async () => {
    stubDashboard({ favorites: [], recent: [] }, [invitation]);

    renderApp('/');

    const invitations = await screen.findByRole('list', { name: 'Invitations' });
    expect(invitations).toHaveTextContent('Anna invited you to Flat');
    expect(within(invitations).getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('leaves invitations out when there are none', async () => {
    stubDashboard({ favorites: [], recent: [] });

    renderApp('/');

    await screen.findByText('No favorite lists yet');
    expect(screen.queryByRole('list', { name: 'Invitations' })).not.toBeInTheDocument();
  });
});
