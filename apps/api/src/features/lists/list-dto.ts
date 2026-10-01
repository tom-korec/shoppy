import type { ListDto } from '@shoppy/shared';
import type { List } from '../../generated/prisma/client.js';

export const LIST_DTO_INCLUDE = { _count: { select: { entries: true } } } as const;

type ListRow = List & { _count: { entries: number } };

export function toListDto(list: ListRow): ListDto {
  return {
    id: list.id,
    name: list.name,
    icon: list.icon,
    isArchived: list.archivedAt !== null,
    entryCount: list._count.entries,
    createdAt: list.createdAt.toISOString(),
  };
}
