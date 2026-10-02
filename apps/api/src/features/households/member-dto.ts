import { effectivePermissions, type MemberDto } from '@shoppy/shared';
import { toPermissionOverrides } from '../../common/scope/to-permission-overrides.js';
import type { HouseholdMember, MemberPermissionOverride } from '../../generated/prisma/client.js';

export const MEMBER_DTO_INCLUDE = {
  user: { select: { displayName: true, email: true } },
  overrides: true,
} as const;

type MemberRow = HouseholdMember & {
  user: { displayName: string; email: string };
  overrides: MemberPermissionOverride[];
};

export function toMemberDto(member: MemberRow): MemberDto {
  const overrides = toPermissionOverrides(member.overrides);
  return {
    id: member.id,
    userId: member.userId,
    displayName: member.user.displayName,
    email: member.user.email,
    role: member.role,
    overrides,
    permissions: [...effectivePermissions(member.role, overrides)],
    joinedAt: member.joinedAt.toISOString(),
  };
}
