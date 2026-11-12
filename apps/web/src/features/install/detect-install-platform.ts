export type InstallPlatform = 'installed' | 'ios' | 'other';

// iOS has no install prompt: the app is added from the Share menu. iPadOS reports itself as a Mac.
export function detectInstallPlatform(win: Window = window): InstallPlatform {
  const isStandalone =
    win.matchMedia?.('(display-mode: standalone)').matches ||
    ('standalone' in win.navigator && win.navigator.standalone === true);
  if (isStandalone) return 'installed';
  const { userAgent, maxTouchPoints } = win.navigator;
  const isIos =
    /iPhone|iPad|iPod/.test(userAgent) || (userAgent.includes('Macintosh') && maxTouchPoints > 1);
  return isIos ? 'ios' : 'other';
}
