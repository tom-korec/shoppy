import type { ListDto } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';

interface ListCardProps {
  list: ListDto;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <li>
      <Link
        to="/lists/$listId"
        params={{ listId: list.id }}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <AppIcon name={list.icon} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{list.name}</span>
          <span className="text-sm text-muted-foreground">
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
