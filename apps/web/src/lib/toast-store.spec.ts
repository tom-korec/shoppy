import { ToastStore } from './toast-store';

describe('ToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides a toast after five seconds', () => {
    const store = new ToastStore();
    store.show('Milk');

    vi.advanceTimersByTime(5000);

    expect(store.getToast()).toBeNull();
  });

  it('replaces the current toast and restarts the timer', () => {
    const store = new ToastStore();
    store.show('Milk');
    vi.advanceTimersByTime(4000);

    store.show('Bread');
    vi.advanceTimersByTime(4000);

    expect(store.getToast()?.message).toBe('Bread');
  });
});
