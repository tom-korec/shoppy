import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  effectivePermissions,
  type HouseholdDto,
  type HouseholdInput,
  HOUSEHOLDS_MAX_PER_USER,
  type TransferOwnershipInput,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { householdScope, personalScope } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import { toPermissionOverrides } from '../../common/scope/to-permission-overrides.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { seedDefaultCategories } from '../categories/seed-default-categories.js';
import { HOUSEHOLD_DTO_INCLUDE, toHouseholdDto } from './household-dto.js';

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly writeBudget: UserWriteBudget,
  ) {}

  // FR-H1: the creator becomes the Owner; the household starts with the predefined categories.
  async create(user: AuthUser, input: HouseholdInput): Promise<HouseholdDto> {
    this.writeBudget.spend(user, 1);
    const household = await this.prisma.$transaction(async (tx) => {
      await lockScope(tx, personalScope(user));
      const count = await tx.householdMember.count({ where: { userId: user.id } });
      if (count >= HOUSEHOLDS_MAX_PER_USER) {
        throw new ConflictException(`You can be in at most ${HOUSEHOLDS_MAX_PER_USER} households`);
      }
      const created = await tx.household.create({
        data: { name: input.name, members: { create: { userId: user.id, role: 'OWNER' } } },
        include: HOUSEHOLD_DTO_INCLUDE,
      });
      await seedDefaultCategories(tx, householdScope(created.id));
      return created;
    });
    return toHouseholdDto(household, await this.access.grant(user, householdScope(household.id)));
  }

  async listMine(user: AuthUser): Promise<HouseholdDto[]> {
    const memberships = await this.prisma.householdMember.findMany({
      where: { userId: user.id },
      include: { household: { include: HOUSEHOLD_DTO_INCLUDE }, overrides: true },
      orderBy: { joinedAt: 'asc' },
    });
    return memberships.map((member) =>
      toHouseholdDto(member.household, {
        role: member.role,
        permissions: effectivePermissions(member.role, toPermissionOverrides(member.overrides)),
      }),
    );
  }

  async get(user: AuthUser, id: string): Promise<HouseholdDto> {
    const grant = await this.access.grant(user, householdScope(id));
    return toHouseholdDto(await this.findHousehold(id), grant);
  }

  async rename(user: AuthUser, id: string, input: HouseholdInput): Promise<HouseholdDto> {
    const grant = await this.access.require(user, householdScope(id), 'household.rename');
    const household = await this.prisma.household.update({
      where: { id },
      data: { name: input.name },
      include: HOUSEHOLD_DTO_INCLUDE,
    });
    return toHouseholdDto(household, grant);
  }

  // FR-H7: lists, items, categories, history and invitations go with it (ON DELETE CASCADE).
  // Lists go first: cascading items would otherwise turn entries into rows with neither an
  // item nor a text, which their CHECK constraint rejects.
  async delete(user: AuthUser, id: string): Promise<void> {
    await this.access.require(user, householdScope(id), 'household.delete');
    await this.prisma.$transaction([
      this.prisma.list.deleteMany({ where: { householdId: id } }),
      this.prisma.household.deleteMany({ where: { id } }),
    ]);
  }

  // FR-H6: the old Owner becomes an Admin.
  async transfer(user: AuthUser, id: string, input: TransferOwnershipInput): Promise<HouseholdDto> {
    await this.prisma.$transaction(async (tx) => {
      // Checked under the household lock, so a second transfer sent at the same time sees that
      // the user is no longer the Owner.
      await lockScope(tx, householdScope(id));
      await this.access.require(user, householdScope(id), 'household.transfer', tx);
      const target = await tx.householdMember.findFirst({
        where: { id: input.memberId, householdId: id },
      });
      if (!target) throw new NotFoundException('Member not found');
      if (target.userId === user.id) throw new BadRequestException('You already own it');

      // Demote first: the one-owner index allows a single OWNER row at any time.
      await tx.householdMember.update({
        where: { householdId_userId: { householdId: id, userId: user.id } },
        data: { role: 'ADMIN' },
      });
      await tx.householdMember.update({ where: { id: target.id }, data: { role: 'OWNER' } });
      await tx.memberPermissionOverride.deleteMany({ where: { memberId: target.id } });
    });
    return this.get(user, id);
  }

  // FR-H5: the Owner can't leave without transferring ownership first.
  async leave(user: AuthUser, id: string): Promise<void> {
    const grant = await this.access.grant(user, householdScope(id));
    if (grant.role === 'OWNER') {
      throw new ConflictException('Transfer ownership before leaving, or delete the household');
    }
    await this.prisma.householdMember.deleteMany({ where: { householdId: id, userId: user.id } });
  }

  private async findHousehold(id: string) {
    const household = await this.prisma.household.findUnique({
      where: { id },
      include: HOUSEHOLD_DTO_INCLUDE,
    });
    if (!household) throw new NotFoundException('Household not found');
    return household;
  }
}
