import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CategoryDto } from '@shoppy/shared';
import {
  CATEGORY_DRAG_INSTRUCTIONS,
  categoryDragAnnouncements,
} from './category-drag-announcements';
import { SortableCategoryRow } from './sortable-category-row';

interface SortableCategoryListProps {
  categories: CategoryDto[];
  isReorderable: boolean;
  onReorder: (ordered: CategoryDto[]) => void;
  onOpen?: (category: CategoryDto) => void;
}

export function SortableCategoryList({
  categories,
  isReorderable,
  onReorder,
  onOpen,
}: SortableCategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: string | number) =>
    categories.find((category) => category.id === id)?.name ?? '';

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = categories.findIndex(({ id }) => id === active.id);
    const to = categories.findIndex(({ id }) => id === over.id);
    onReorder(arrayMove(categories, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: categoryDragAnnouncements(nameOf),
        screenReaderInstructions: CATEGORY_DRAG_INSTRUCTIONS,
      }}
    >
      <SortableContext items={categories} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <SortableCategoryRow
              key={category.id}
              category={category}
              isReorderable={isReorderable}
              onOpen={onOpen && (() => onOpen(category))}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
