import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  canManageRole,
  type MemberDto,
  type Permission,
  type PermissionOverride,
  type Role,
  ROLE_CEILINGS,
  type UpdateMemberInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { householdScope } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { toPermissionOverrides } from '../../common/scope/to-permission-overrides.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { MEMBER_DTO_INCLUDE, toMemberDto } from './member-dto.js';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
  ) {}

  async list(user: AuthUser, householdId: string): Promise<MemberDto[]> {
    await this.access.grant(user, householdScope(householdId));
    const members = await this.prisma.householdMember.findMany({
      where: { householdId },
      include: MEMBER_DTO_INCLUDE,
      orderBy: { joinedAt: 'asc' },
    });
    return members.map(toMemberDto);
  }

  // FR-H8 / FR-R6: only the Owner manages Admins; Admins manage Members and Viewers. Overrides
  // stay within the role's ceiling (FR-R4).
  async update(user: AuthUser, memberId: string, input: UpdateMemberInput): Promise<MemberDto> {
    const target = await this.findMember(user, memberId);
    const actorRole = await this.requireManager(user, target, [
      ...(input.role ? (['member.changeRole'] as const) : []),
      ...(input.overrides ? (['member.editPermissions'] as const) : []),
    ]);
    const role = input.role ?? target.role;
    if (!canManageRole(actorRole, role)) {
      throw new ForbiddenException('You can only give roles below your own');
    }
    if (input.overrides) assertWithinCeiling(role, input.overrides);

    await this.prisma.$transaction(async (tx) => {
      await tx.householdMember.update({ where: { id: memberId }, data: { role } });
      // A demotion drops overrides the new role can't have.
      const overrides = (input.overrides ?? toPermissionOverrides(target.overrides)).filter(
        ({ permission }) => ROLE_CEILINGS[role].has(permission),
      );
      await tx.memberPermissionOverride.deleteMany({ where: { memberId } });
      await tx.memberPermissionOverride.createMany({
        data: overrides.map(({ permission, isGranted }) => ({ memberId, permission, isGranted })),
      });
    });
    return toMemberDto(
      await this.prisma.householdMember.findUniqueOrThrow({
        where: { id: memberId },
        include: MEMBER_DTO_INCLUDE,
      }),
    );
  }

  async remove(user: AuthUser, memberId: string): Promise<void> {
    const target = await this.findMember(user, memberId);
    if (target.userId === user.id) {
      throw new BadRequestException('Use "Leave household" to remove yourself');
    }
    await this.requireManager(user, target, ['member.remove']);
    await this.prisma.householdMember.deleteMany({ where: { id: memberId } });
  }

  // Members of the user's own households only; anyone else's are reported missing.
  private async findMember(user: AuthUser, memberId: string) {
    const member = await this.prisma.householdMember.findFirst({
      where: { id: memberId, household: { members: { some: { userId: user.id } } } },
      include: { overrides: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  private async requireManager(
    user: AuthUser,
    target: { householdId: string; role: Role; userId: string },
    permissions: Permission[],
  ): Promise<Role> {
    const grant = await this.access.require(user, householdScope(target.householdId), permissions);
    const actorRole = grant.role ?? 'OWNER';
    if (target.userId === user.id || !canManageRole(actorRole, target.role)) {
      throw new ForbiddenException("You can't manage this member");
    }
    return actorRole;
  }
}

function assertWithinCeiling(role: Role, overrides: readonly PermissionOverride[]): void {
  const outside = overrides.find(
    ({ permission, isGranted }) => isGranted && !ROLE_CEILINGS[role].has(permission),
  );
  if (outside) {
    throw new BadRequestException(`A ${role.toLowerCase()} can't have ${outside.permission}`);
  }
}
