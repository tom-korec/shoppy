import type { ListDto, ScopeRef } from '@shoppy/shared';
import type { List } from '../../generated/prisma/client.js';

export const LIST_DTO_INCLUDE = {
  _count: { select: { entries: true } },
  household: { select: { name: true } },
} as const;

type ListRow = List & { _count: { entries: number }; household: { name: string } | null };

export function toListDto(list: ListRow): ListDto {
  return {
    id: list.id,
    name: list.name,
    icon: list.icon,
    isArchived: list.archivedAt !== null,
    entryCount: list._count.entries,
    scope: toScopeRef(list),
    createdAt: list.createdAt.toISOString(),
    lastActivityAt: list.lastActivityAt.toISOString(),
  };
}

function toScopeRef(list: ListRow): ScopeRef {
  if (list.householdId && list.household) {
    return { kind: 'household', householdId: list.householdId, householdName: list.household.name };
  }
  return { kind: 'personal' };
}
