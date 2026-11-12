import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { listDetailKey } from '@/features/lists/list-query-keys';
import { LIST_ID } from '@/test/shopping-fixtures';
import { entryMutationKey } from './list-cache';
import { usePollList } from './use-poll-list';

function renderPoll() {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  renderHook(() => usePollList(LIST_ID), { wrapper });
  return { queryClient, invalidate };
}

function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
}

describe('usePollList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('refetches the open list every 30 seconds', () => {
    setVisibility('visible');
    const { invalidate } = renderPoll();

    vi.advanceTimersByTime(30_000);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: listDetailKey(LIST_ID), exact: true });
  });

  it('skips while the app is in the background', () => {
    setVisibility('hidden');
    const { invalidate } = renderPoll();

    vi.advanceTimersByTime(30_000);

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("skips while the user's own changes to the list are on their way", () => {
    setVisibility('visible');
    const { queryClient, invalidate } = renderPoll();
    vi.spyOn(queryClient, 'isMutating').mockImplementation((filters) =>
      JSON.stringify(filters?.mutationKey) === JSON.stringify(entryMutationKey(LIST_ID)) ? 1 : 0,
    );

    vi.advanceTimersByTime(30_000);

    expect(invalidate).not.toHaveBeenCalled();
  });
});
