import type { ListDto } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { ChevronRight, House, User } from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';

interface ListCardProps {
  list: ListDto;
  showsScope: boolean;
}

// With grouping off, each card says where the list belongs.
export function ListCard({ list, showsScope }: ListCardProps) {
  return (
    <li>
      <Link
        to="/lists/$listId"
        params={{ listId: list.id }}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4 lg:min-h-20 lg:hover:border-primary/40 lg:hover:bg-muted/50"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <AppIcon name={list.icon} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{list.name}</span>
          <span className="text-sm text-muted-foreground">
            {showsScope && (
              <span className="mr-1.5 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {list.scope.kind === 'household' ? (
                  <House className="size-3" aria-hidden />
                ) : (
                  <User className="size-3" aria-hidden />
                )}
                {list.scope.kind === 'household' ? list.scope.householdName : 'Personal'}
              </span>
            )}
            {list.entryCount === 0
              ? 'Empty'
              : `${list.entryCount} ${list.entryCount === 1 ? 'entry' : 'entries'}`}
          </span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
