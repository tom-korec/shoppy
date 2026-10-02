import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type HouseholdDto,
  HOUSEHOLDS_MAX_PER_USER,
  type InvitationPreviewDto,
  type InvitationRef,
  MEMBERS_MAX_PER_HOUSEHOLD,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import { lockScope } from '../../common/scope/lock-scope.js';
import { householdScope } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { hashOpaqueToken } from '../auth/opaque-token.js';
import { HouseholdsService } from '../households/households.service.js';
import { activeInvitationWhere, hasUsesLeft } from './active-invitation-where.js';
import { hashInviteCode } from './invite-code.js';

const INVALID = 'This invitation is no longer valid';
// Codes are short, so guessing them is rate limited per user.
const REDEEM_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };

const INVITATION_INCLUDE = {
  household: { select: { name: true } },
  createdBy: { select: { displayName: true } },
} as const;

@Injectable()
export class InvitationRedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly households: HouseholdsService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  // Email invitations addressed to the user that they haven't answered yet (FR-H3).
  async pending(user: AuthUser): Promise<InvitationPreviewDto[]> {
    const { email } = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const invitations = await this.prisma.invitation.findMany({
      where: {
        kind: 'EMAIL',
        email,
        ...activeInvitationWhere(),
        household: { members: { none: { userId: user.id } } },
      },
      include: INVITATION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return invitations.filter(hasUsesLeft).map((invitation) => toPreview(invitation, false));
  }

  async preview(user: AuthUser, ref: InvitationRef): Promise<InvitationPreviewDto> {
    const invitation = await this.find(this.prisma, user, ref);
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId: invitation.householdId, userId: user.id } },
    });
    return toPreview(invitation, member !== null);
  }

  // Joining twice is harmless: a member who opens the link again just gets the household.
  async accept(user: AuthUser, ref: InvitationRef): Promise<HouseholdDto> {
    const householdId = await this.prisma.$transaction(async (tx) => {
      const invitation = await this.find(tx, user, ref);
      await lockScope(tx, householdScope(invitation.householdId));
      const existing = await tx.householdMember.findUnique({
        where: { householdId_userId: { householdId: invitation.householdId, userId: user.id } },
      });
      if (existing) return invitation.householdId;

      const [members, memberships] = await Promise.all([
        tx.householdMember.count({ where: { householdId: invitation.householdId } }),
        tx.householdMember.count({ where: { userId: user.id } }),
      ]);
      if (members >= MEMBERS_MAX_PER_HOUSEHOLD) {
        throw new ConflictException('This household is full');
      }
      if (memberships >= HOUSEHOLDS_MAX_PER_USER) {
        throw new ConflictException(`You can be in at most ${HOUSEHOLDS_MAX_PER_USER} households`);
      }

      await tx.householdMember.create({
        data: { householdId: invitation.householdId, userId: user.id, role: invitation.role },
      });
      // Only counts if nobody used the invitation since it was read, so parallel joins can't
      // exceed max uses.
      const { count } = await tx.invitation.updateMany({
        where: { id: invitation.id, usedCount: invitation.usedCount },
        data: { usedCount: { increment: 1 } },
      });
      if (count === 0) throw new ConflictException(INVALID);
      return invitation.householdId;
    });
    return this.households.get(user, householdId);
  }

  async decline(user: AuthUser, invitationId: string): Promise<void> {
    const invitation = await this.find(this.prisma, user, { invitationId });
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { declinedAt: new Date() },
    });
  }

  // An invitation that doesn't exist, is used up, or isn't addressed to this user all look the
  // same, so secrets and addresses can't be probed.
  private async find(db: DbClient, user: AuthUser, ref: InvitationRef) {
    if (!('invitationId' in ref)) {
      this.rateLimiter.consume(`invite-redeem:user:${user.id}`, REDEEM_LIMIT);
    }
    const { email } = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    const invitation = await db.invitation.findFirst({
      where: { ...byRef(ref, email), ...activeInvitationWhere() },
      include: INVITATION_INCLUDE,
    });
    if (!invitation || !hasUsesLeft(invitation)) throw new NotFoundException(INVALID);
    if (invitation.kind === 'EMAIL' && invitation.email?.toLowerCase() !== email.toLowerCase()) {
      throw new NotFoundException(INVALID);
    }
    return invitation;
  }
}

function byRef(ref: InvitationRef, email: string) {
  if ('token' in ref) return { tokenHash: hashOpaqueToken(ref.token) };
  if ('code' in ref) return { codeHash: hashInviteCode(ref.code) };
  return { id: ref.invitationId, kind: 'EMAIL' as const, email };
}

function toPreview(
  invitation: {
    id: string;
    householdId: string;
    role: InvitationPreviewDto['role'];
    expiresAt: Date;
    household: { name: string };
    createdBy: { displayName: string } | null;
  },
  isAlreadyMember: boolean,
): InvitationPreviewDto {
  return {
    invitationId: invitation.id,
    householdId: invitation.householdId,
    householdName: invitation.household.name,
    role: invitation.role,
    invitedBy: invitation.createdBy?.displayName ?? null,
    expiresAt: invitation.expiresAt.toISOString(),
    isAlreadyMember,
  };
}
