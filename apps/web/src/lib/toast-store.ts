export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

type Listener = () => void;

const TOAST_DURATION_MS = 5000;

// One toast at a time: a new one replaces the current one (e.g. checking items in a row).
export class ToastStore {
  private toast: Toast | null = null;
  private nextId = 1;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<Listener>();

  getToast = (): Toast | null => this.toast;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  show(message: string, action?: ToastAction): void {
    const toast = { id: this.nextId++, message, action };
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.dismiss(toast.id), TOAST_DURATION_MS);
    this.setToast(toast);
  }

  dismiss(id: number): void {
    if (this.toast?.id !== id) return;
    clearTimeout(this.timer);
    this.setToast(null);
  }

  private setToast(toast: Toast | null): void {
    this.toast = toast;
    for (const listener of this.listeners) listener();
  }
}

export const toastStore = new ToastStore();
