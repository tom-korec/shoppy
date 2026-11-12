import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToggleFavorite } from './use-toggle-favorite';

interface FavoriteButtonProps {
  listId: string;
  isFavorite: boolean;
}

export function FavoriteButton({ listId, isFavorite }: FavoriteButtonProps) {
  const toggle = useToggleFavorite(listId);
  return (
    <button
      type="button"
      aria-label="Favorite"
      aria-pressed={isFavorite}
      onClick={() => toggle.mutate(!isFavorite)}
      className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
    >
      <Star
        className={cn('size-5', isFavorite ? 'fill-warning text-warning' : 'text-foreground')}
        aria-hidden
      />
    </button>
  );
}
