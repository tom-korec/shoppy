import type { CategoryDto, ItemDto } from '@shoppy/shared';
import { AppIcon } from '@/components/ui/app-icon';

interface ItemRowProps {
  item: ItemDto;
  category: CategoryDto | undefined;
  onOpen: () => void;
}

export function ItemRow({ item, category, onOpen }: ItemRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-muted"
      >
        <AppIcon name={category?.icon ?? 'tag'} className="text-muted-foreground" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{item.name}</span>
          {item.description && (
            <span className="truncate text-sm text-muted-foreground">{item.description}</span>
          )}
        </span>
      </button>
    </li>
  );
}
