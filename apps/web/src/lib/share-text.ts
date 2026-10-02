import { toastStore } from './toast-store';

// The phone's share sheet where there is one (send the invite in a messenger), else the clipboard.
export async function shareText(title: string, text: string): Promise<void> {
  if (typeof navigator.share === 'function') {
    await navigator.share({ title, text }).catch(() => undefined);
    return;
  }
  await copyText(text);
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toastStore.show('Copied');
  } catch {
    toastStore.show("Couldn't copy. Select the text and copy it instead.");
  }
}
