import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Installed PWAs can stay open for days without a reload.
      if (registration) {
        setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg"
    >
      <p className="flex-1 text-sm">A new version of Shoppy is available.</p>
      <button
        type="button"
        className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
        onClick={() => setNeedRefresh(false)}
      >
        Later
      </button>
      <button
        type="button"
        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => void updateServiceWorker(true)}
      >
        Reload
      </button>
    </div>
  );
}
