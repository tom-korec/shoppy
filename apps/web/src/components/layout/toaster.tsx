import { useSyncExternalStore } from 'react';
import { toastStore } from '@/lib/toast-store';

export function Toaster() {
  const toast = useSyncExternalStore(toastStore.subscribe, toastStore.getToast);

  return (
    <output
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      {toast && (
        <div className="pointer-events-auto flex max-w-md min-w-0 flex-1 items-center gap-3 rounded-2xl bg-foreground py-2 pr-2 pl-4 text-background shadow-lg">
          <p className="min-w-0 flex-1 truncate">{toast.message}</p>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                toastStore.dismiss(toast.id);
              }}
              className="min-h-11 shrink-0 rounded-xl px-3 font-bold underline underline-offset-4"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </output>
  );
}
