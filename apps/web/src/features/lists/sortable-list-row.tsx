import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ListDto } from '@shoppy/shared';
import { GripVertical } from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';
import { cn } from '@/lib/cn';

interface SortableListRowProps {
  list: ListDto;
}

export function SortableListRow({ list }: SortableListRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card pl-4',
        isDragging && 'relative z-10 shadow-lg',
      )}
    >
      <AppIcon name={list.icon} className="text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-medium">{list.name}</span>
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={`Reorder ${list.name}`}
        className="flex size-11 touch-none items-center justify-center text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
    </li>
  );
}
