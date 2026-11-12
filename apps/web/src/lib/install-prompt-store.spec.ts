import { InstallPromptStore } from './install-prompt-store';

function installEvent(prompt = vi.fn(() => Promise.resolve())) {
  return Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt });
}

describe('InstallPromptStore', () => {
  it("keeps Chrome's install event instead of letting Chrome show its banner", () => {
    const target = new EventTarget() as Window;
    const store = new InstallPromptStore();
    store.listen(target);
    const event = installEvent();

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(store.canPrompt()).toBe(true);
  });

  it('prompts once', async () => {
    const target = new EventTarget() as Window;
    const store = new InstallPromptStore();
    store.listen(target);
    const prompt = vi.fn(() => Promise.resolve());
    target.dispatchEvent(installEvent(prompt));

    await store.prompt();
    await store.prompt();

    expect(prompt).toHaveBeenCalledOnce();
    expect(store.canPrompt()).toBe(false);
  });

  it('forgets the event once the app is installed', () => {
    const target = new EventTarget() as Window;
    const store = new InstallPromptStore();
    store.listen(target);
    target.dispatchEvent(installEvent());

    target.dispatchEvent(new Event('appinstalled'));

    expect(store.canPrompt()).toBe(false);
  });
});
