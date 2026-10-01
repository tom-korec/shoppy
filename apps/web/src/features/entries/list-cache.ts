import type { EntryDto, ListDetailDto } from '@shoppy/shared';
import type { QueryClient } from '@tanstack/react-query';
import { listDetailKey } from '@/features/lists/list-query-keys';

export const entryMutationKey = (listId: string) => ['entries', listId];

// All changes to one list share a key (to know when the last one settles) and a scope, which
// runs them one after another: checking an entry that is still being created must wait for it.
export function listMutationOptions(listId: string) {
  return { mutationKey: entryMutationKey(listId), scope: { id: `entries:${listId}` } };
}

export interface ListSnapshot {
  previous: ListDetailDto | undefined;
}

// Optimistic change to a list's entries; returns the previous state for rollback.
export async function updateCachedEntries(
  queryClient: QueryClient,
  listId: string,
  update: (entries: EntryDto[]) => EntryDto[],
): Promise<ListSnapshot> {
  await queryClient.cancelQueries({ queryKey: listDetailKey(listId), exact: true });
  const previous = queryClient.getQueryData<ListDetailDto>(listDetailKey(listId));
  if (previous) {
    const entries = update(previous.entries);
    queryClient.setQueryData<ListDetailDto>(listDetailKey(listId), {
      ...previous,
      entries,
      entryCount: entries.length,
    });
  }
  return { previous };
}

export function rollbackEntries(
  queryClient: QueryClient,
  listId: string,
  snapshot: ListSnapshot | undefined,
): void {
  if (snapshot?.previous) queryClient.setQueryData(listDetailKey(listId), snapshot.previous);
}

// Refetch only once the last pending change of the list has settled; refetching earlier would
// briefly drop optimistic entries that are still on their way to the server.
// Entries are listed in id order (UUIDv7), so an undone check or delete returns to its place.
export function insertById(entries: EntryDto[], entry: EntryDto): EntryDto[] {
  const index = entries.findIndex(({ id }) => id > entry.id);
  return index === -1 ? [...entries, entry] : entries.toSpliced(index, 0, entry);
}

export async function settleList(queryClient: QueryClient, listId: string): Promise<void> {
  if (queryClient.isMutating({ mutationKey: entryMutationKey(listId) }) > 1) return;
  await queryClient.invalidateQueries({ queryKey: listDetailKey(listId) });
}
