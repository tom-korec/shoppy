import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from '@dnd-kit/core';

type NameOf = (id: UniqueIdentifier) => string;

// dnd-kit announces raw ids by default; read out category names instead.
export function categoryDragAnnouncements(nameOf: NameOf): Announcements {
  return {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over ${nameOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${nameOf(active.id)} moved to the place of ${nameOf(over.id)}.`
        : `${nameOf(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} cancelled.`,
  };
}

export const CATEGORY_DRAG_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'To reorder, press space or enter, move with the arrow keys, then press space or enter again. Press escape to cancel.',
};
