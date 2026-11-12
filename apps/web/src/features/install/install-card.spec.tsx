import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { installPromptStore } from '@/lib/install-prompt-store';
import { InstallCard } from './install-card';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';

function useUserAgent(userAgent: string) {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
}

describe('InstallCard', () => {
  beforeAll(() => {
    installPromptStore.listen(window);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('explains Add to Home Screen on iOS and remembers when dismissed', async () => {
    useUserAgent(IPHONE);
    const { unmount } = render(<InstallCard />);

    expect(screen.getByText('Add to Home Screen')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    unmount();
    render(<InstallCard />);

    expect(screen.queryByRole('region', { name: 'Install Shoppy' })).not.toBeInTheDocument();
  });

  it("offers Chrome's install prompt when the browser allows it", async () => {
    const prompt = vi.fn(() => Promise.resolve());
    render(<InstallCard />);
    expect(screen.queryByRole('region', { name: 'Install Shoppy' })).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), { prompt }));
    });
    await userEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(prompt).toHaveBeenCalledOnce();
  });
});
