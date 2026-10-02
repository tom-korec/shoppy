import type { HouseholdDto } from '@shoppy/shared';
import type { ScopeGrant } from '../../common/scope/scope-access.service.js';

interface HouseholdRow {
  id: string;
  name: string;
  _count: { members: number };
}

export const HOUSEHOLD_DTO_INCLUDE = { _count: { select: { members: true } } } as const;

export function toHouseholdDto(household: HouseholdRow, grant: ScopeGrant): HouseholdDto {
  return {
    id: household.id,
    name: household.name,
    memberCount: household._count.members,
    myRole: grant.role ?? 'OWNER',
    myPermissions: [...grant.permissions],
  };
}
