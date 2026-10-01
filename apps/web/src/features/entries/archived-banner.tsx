import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArchivedBannerProps {
  isPending: boolean;
  onUnarchive: () => void;
}

export function ArchivedBanner({ isPending, onUnarchive }: ArchivedBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-3">
      <Archive className="size-5 text-muted-foreground" aria-hidden />
      <p className="flex-1 text-sm">This list is archived and read-only.</p>
      <Button variant="secondary" isLoading={isPending} onClick={onUnarchive}>
        Unarchive
      </Button>
    </div>
  );
}
