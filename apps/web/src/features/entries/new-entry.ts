import { type CreateEntryInput, type EntryDto, type ItemDto, uuidV7 } from '@shoppy/shared';

export type EntryDraft =
  | { item: ItemDto; note: string | null }
  | { text: string; categoryId: string | null; note: string | null };

// The request and the optimistic entry share a client-chosen id, so the entry keeps its
// identity once the server confirms it.
export interface NewEntry {
  input: CreateEntryInput & { id: string };
  optimistic: EntryDto;
}

export function buildNewEntry(listId: string, draft: EntryDraft): NewEntry {
  const id = uuidV7();
  const base = {
    id,
    listId,
    note: draft.note,
    isChecked: false,
    createdAt: new Date().toISOString(),
  };
  if ('item' in draft) {
    return {
      input: { id, itemId: draft.item.id, note: draft.note },
      optimistic: {
        ...base,
        itemId: draft.item.id,
        name: draft.item.name,
        categoryId: draft.item.categoryId,
      },
    };
  }
  return {
    input: { id, text: draft.text, categoryId: draft.categoryId, note: draft.note },
    optimistic: { ...base, itemId: null, name: draft.text, categoryId: draft.categoryId },
  };
}

// Undo of a delete puts the same entry back.
export function recreateEntry(entry: EntryDto): NewEntry {
  const input = entry.itemId
    ? { id: entry.id, itemId: entry.itemId, note: entry.note }
    : { id: entry.id, text: entry.name, categoryId: entry.categoryId, note: entry.note };
  return { input, optimistic: { ...entry, isChecked: false } };
}
