import type { ItemDto } from '@shoppy/shared';
import type { Item } from '../../generated/prisma/client.js';

export function toItemDto(item: Item): ItemDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
  };
}
