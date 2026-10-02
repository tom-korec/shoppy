import type { ListDto, ListViewDto } from '@shoppy/shared';

export interface ListSection {
  key: string;
  title: string | null;
  lists: ListDto[];
}

const newestFirst = (field: 'createdAt' | 'lastActivityAt') => (a: ListDto, b: ListDto) =>
  b[field].localeCompare(a[field]);

// Custom order: lists the user ordered first, in their order; newer lists after, newest first.
export function sortLists(
  lists: ListDto[],
  view: Pick<ListViewDto, 'sort' | 'customOrder'>,
): ListDto[] {
  if (view.sort === 'ACTIVITY') return [...lists].sort(newestFirst('lastActivityAt'));
  const byCreated = [...lists].sort(newestFirst('createdAt'));
  if (view.sort === 'CREATED') return byCreated;
  const position = new Map(view.customOrder.map((id, index) => [id, index]));
  const ordered = byCreated.filter(({ id }) => position.has(id));
  ordered.sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
  return [...ordered, ...byCreated.filter(({ id }) => !position.has(id))];
}

// Grouped: Personal first, then each household by name. Ungrouped: one section without a title.
export function sectionLists(lists: ListDto[], isGrouped: boolean): ListSection[] {
  if (!isGrouped) return [{ key: 'all', title: null, lists }];
  const personal = lists.filter(({ scope }) => scope.kind === 'personal');
  const households = new Map<string, ListSection>();
  for (const list of lists) {
    if (list.scope.kind !== 'household') continue;
    const section = households.get(list.scope.householdId) ?? {
      key: list.scope.householdId,
      title: list.scope.householdName,
      lists: [],
    };
    section.lists.push(list);
    households.set(list.scope.householdId, section);
  }
  const sorted = [...households.values()].sort((a, b) =>
    (a.title ?? '').localeCompare(b.title ?? ''),
  );
  return [{ key: 'personal', title: 'Personal', lists: personal }, ...sorted].filter(
    (section) => section.lists.length > 0,
  );
}
