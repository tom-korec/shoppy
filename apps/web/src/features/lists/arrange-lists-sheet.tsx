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
import type { ListDto } from '@shoppy/shared';
import { Sheet } from '@/components/ui/sheet';
import { SortableListRow } from './sortable-list-row';
import { useReorderLists } from './use-reorder-lists';

interface ArrangeListsSheetProps {
  isOpen: boolean;
  lists: ListDto[];
  onClose: () => void;
}

export function ArrangeListsSheet({ isOpen, lists, onClose }: ArrangeListsSheetProps) {
  const reorder = useReorderLists();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const nameOf = (id: string | number) => lists.find((list) => list.id === id)?.name ?? '';

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = lists.findIndex(({ id }) => id === active.id);
    const to = lists.findIndex(({ id }) => id === over.id);
    reorder.mutate(arrayMove(lists, from, to).map(({ id }) => id));
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Arrange lists">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
            onDragOver: ({ active, over }) =>
              over ? `${nameOf(active.id)} is over ${nameOf(over.id)}.` : undefined,
            onDragEnd: ({ active, over }) =>
              over ? `${nameOf(active.id)} moved to the place of ${nameOf(over.id)}.` : undefined,
            onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} cancelled.`,
          },
        }}
      >
        <SortableContext items={lists} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {lists.map((list) => (
              <SortableListRow key={list.id} list={list} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </Sheet>
  );
}
