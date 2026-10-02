import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { effectivePermissions, type Permission, PERMISSIONS, type Role } from '@shoppy/shared';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import type { AuthUser } from '../auth/auth-user.js';
import type { Scope } from './scope.js';
import { toPermissionOverrides } from './to-permission-overrides.js';

export interface ScopeGrant {
  role: Role | null;
  permissions: ReadonlySet<Permission>;
}

const EVERYTHING: ScopeGrant = { role: null, permissions: new Set(PERMISSIONS) };

// What the user may do in a scope: everything in their personal scope (FR-R7), their effective
// permissions in a household they belong to (FR-R5). Anyone else gets 404.
@Injectable()
export class ScopeAccess {
  constructor(private readonly prisma: PrismaService) {}

  async grant(user: AuthUser, scope: Scope, db: DbClient = this.prisma): Promise<ScopeGrant> {
    if (scope.kind === 'personal') {
      if (scope.userId !== user.id) throw new NotFoundException('Not found');
      return EVERYTHING;
    }
    const member = await db.householdMember.findUnique({
      where: { householdId_userId: { householdId: scope.householdId, userId: user.id } },
      include: { overrides: true },
    });
    if (!member) throw new NotFoundException('Household not found');
    const overrides = toPermissionOverrides(member.overrides);
    return { role: member.role, permissions: effectivePermissions(member.role, overrides) };
  }

  // FR-R1: every household action needs its permission. A single action may need several.
  async require(
    user: AuthUser,
    scope: Scope,
    permissions: Permission | Permission[],
    db: DbClient = this.prisma,
  ): Promise<ScopeGrant> {
    const grant = await this.grant(user, scope, db);
    const missing = [permissions].flat().find((permission) => !grant.permissions.has(permission));
    if (missing) throw new ForbiddenException(`You don't have the ${missing} permission`);
    return grant;
  }
}
