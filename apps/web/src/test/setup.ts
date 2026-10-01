import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { toastStore } from '@/lib/toast-store';

// The default 1 s is tight when every package's tests run in parallel (turbo, CI).
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  cleanup();
  const toast = toastStore.getToast();
  if (toast) toastStore.dismiss(toast.id);
});

// jsdom doesn't implement modal dialogs; open and close them like a browser would.
// (Worker specs run in node, without a DOM.)
if (typeof HTMLDialogElement !== 'undefined') {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
}
