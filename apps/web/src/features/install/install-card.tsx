import { Share, SquarePlus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toastStore } from '@/lib/toast-store';
import { useInstallOffer } from './use-install-offer';

export function InstallCard() {
  const { offer, install, dismiss } = useInstallOffer();
  if (!offer) return null;

  return (
    <section
      aria-label="Install Shoppy"
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="font-medium">Install Shoppy</p>
          {offer === 'prompt' ? (
            <p className="text-sm text-muted-foreground">
              Open it from your home screen, full screen, like any other app.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tap <Share className="inline size-4 align-text-bottom" aria-label="Share" /> in
              Safari, then <span className="font-medium text-foreground">Add to Home Screen</span>{' '}
              <SquarePlus className="inline size-4 align-text-bottom" aria-hidden />.
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {offer === 'prompt' && (
          <Button
            className="flex-1"
            onClick={() =>
              install().catch(() => toastStore.show("Couldn't open the install prompt"))
            }
          >
            Install
          </Button>
        )}
        <Button variant="secondary" className="flex-1" onClick={dismiss}>
          {offer === 'prompt' ? 'Not now' : 'Got it'}
        </Button>
      </div>
    </section>
  );
}
