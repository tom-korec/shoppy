import type { CategoryDto, ItemDto } from '@shoppy/shared';
import type { ReactNode } from 'react';
import { AppIcon } from '@/components/ui/app-icon';

interface ItemRowProps {
  item: ItemDto;
  category: CategoryDto | undefined;
  control?: ReactNode;
  onOpen?: () => void;
}

export function ItemRow({ item, category, control, onOpen }: ItemRowProps) {
  const content = (
    <>
      <AppIcon name={category?.icon ?? 'tag'} className="text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{item.name}</span>
        {item.description && (
          <span className="truncate text-sm text-muted-foreground">{item.description}</span>
        )}
      </span>
    </>
  );

  return (
    <li className="flex items-center lg:rounded-xl lg:border lg:border-border lg:bg-card">
      {control}
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left hover:bg-muted"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-3">{content}</div>
      )}
    </li>
  );
}
