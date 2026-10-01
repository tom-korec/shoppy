import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CategoryDto } from '@shoppy/shared';
import { GripVertical } from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';
import { cn } from '@/lib/cn';

interface SortableCategoryRowProps {
  category: CategoryDto;
  onOpen: () => void;
}

export function SortableCategoryRow({ category, onOpen }: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-1 rounded-2xl border border-border bg-card pr-1',
        isDragging && 'relative z-10 shadow-lg',
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 pl-4 text-left"
      >
        <AppIcon name={category.icon} className="text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
        <span className="text-sm text-muted-foreground">
          {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
        </span>
      </button>
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={`Reorder ${category.name}`}
        className="flex size-11 touch-none items-center justify-center text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
    </li>
  );
}
