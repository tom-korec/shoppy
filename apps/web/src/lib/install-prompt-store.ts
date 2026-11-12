// Chrome's install event; not in the DOM typings.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

type Listener = () => void;

// Chrome fires `beforeinstallprompt` once, early in the page load, so it is caught here before
// React renders; the dashboard then offers its own Install button instead of Chrome's banner.
export class InstallPromptStore {
  private event: BeforeInstallPromptEvent | null = null;
  private readonly listeners = new Set<Listener>();

  canPrompt = (): boolean => this.event !== null;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  listen(target: Window): void {
    target.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.setEvent(event as BeforeInstallPromptEvent);
    });
    target.addEventListener('appinstalled', () => this.setEvent(null));
  }

  // The event can be used only once.
  async prompt(): Promise<void> {
    const event = this.event;
    this.setEvent(null);
    await event?.prompt();
  }

  private setEvent(event: BeforeInstallPromptEvent | null): void {
    this.event = event;
    for (const listener of this.listeners) listener();
  }
}

export const installPromptStore = new InstallPromptStore();
