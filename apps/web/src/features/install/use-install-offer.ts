import { useState, useSyncExternalStore } from 'react';
import { installPromptStore } from '@/lib/install-prompt-store';
import { detectInstallPlatform } from './detect-install-platform';

const DISMISSED_KEY = 'shoppy.install-offer-dismissed';

export type InstallOffer = 'prompt' | 'ios-guide' | null;

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useInstallOffer() {
  const canPrompt = useSyncExternalStore(
    installPromptStore.subscribe,
    installPromptStore.canPrompt,
  );
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const platform = detectInstallPlatform();

  const offer: InstallOffer = isDismissed
    ? null
    : canPrompt
      ? 'prompt'
      : platform === 'ios'
        ? 'ios-guide'
        : null;

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // Private mode: the offer just comes back next time.
    }
  };

  return { offer, install: () => installPromptStore.prompt(), dismiss };
}
