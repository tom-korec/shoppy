import type { CategoryDto } from '@shoppy/shared';
import type { Category } from '../../generated/prisma/client.js';

export const CATEGORY_DTO_INCLUDE = { _count: { select: { items: true } } } as const;

type CategoryRow = Category & { _count: { items: number } };

export function toCategoryDto(category: CategoryRow): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    position: category.position,
    itemCount: category._count.items,
  };
}
