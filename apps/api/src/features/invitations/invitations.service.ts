import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  canManageRole,
  type CreatedInvitationDto,
  type CreateInvitationInput,
  INVITATION_DAYS_DEFAULT,
  type InvitationDto,
  INVITATIONS_MAX_ACTIVE,
} from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { RateLimiter } from '../../common/rate-limit/rate-limiter.js';
import { UserWriteBudget } from '../../common/rate-limit/user-write-budget.service.js';
import { householdScope } from '../../common/scope/scope.js';
import { ScopeAccess } from '../../common/scope/scope-access.service.js';
import type { Env } from '../../config/env.js';
import { type EmailMessage, EmailSender } from '../../infrastructure/email/email-sender.js';
import { householdInvitationTemplate } from '../../infrastructure/email/templates/household-invitation.template.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { generateOpaqueToken, hashOpaqueToken } from '../auth/opaque-token.js';
import { activeInvitationWhere } from './active-invitation-where.js';
import { generateInviteCode, hashInviteCode } from './invite-code.js';
import { toInvitationDto } from './invitation-dto.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const ROLE_NAMES = { ADMIN: 'an admin', MEMBER: 'a member', VIEWER: 'a viewer' } as const;
const EMAIL_INVITE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);
  private readonly appUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ScopeAccess,
    private readonly emailSender: EmailSender,
    private readonly writeBudget: UserWriteBudget,
    private readonly rateLimiter: RateLimiter,
    config: ConfigService<Env, true>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true });
  }

  // FR-H3 / FR-H4. The link token or code is returned once; only its hash is stored.
  async create(
    user: AuthUser,
    householdId: string,
    input: CreateInvitationInput,
  ): Promise<CreatedInvitationDto> {
    const grant = await this.access.require(user, householdScope(householdId), 'member.invite');
    if (!canManageRole(grant.role ?? 'OWNER', input.role)) {
      throw new ForbiddenException('You can only invite roles below your own');
    }
    this.writeBudget.spend(user, 1);
    await this.assertRoomForInvitation(householdId);

    const expiresAt = new Date(Date.now() + INVITATION_DAYS_DEFAULT * DAY_MS);
    const base = { householdId, role: input.role, expiresAt, createdById: user.id };

    if (input.kind === 'CODE') {
      const code = generateInviteCode();
      const invitation = await this.prisma.invitation.create({
        data: {
          ...base,
          kind: 'CODE',
          codeHash: hashInviteCode(code),
          maxUses: input.maxUses ?? null,
        },
      });
      return { invitation: toInvitationDto(invitation), url: null, code };
    }

    const token = generateOpaqueToken();
    const url = new URL(`/join/${token}`, this.appUrl).toString();
    if (input.kind === 'LINK') {
      const invitation = await this.prisma.invitation.create({
        data: {
          ...base,
          kind: 'LINK',
          tokenHash: hashOpaqueToken(token),
          maxUses: input.maxUses ?? null,
        },
      });
      return { invitation: toInvitationDto(invitation), url, code: null };
    }

    // Each one sends an email to any address; the daily email cap is shared by everyone.
    this.rateLimiter.consume(`invite-email:user:${user.id}`, EMAIL_INVITE_LIMIT);
    await this.assertNotMember(householdId, input.email);
    const invitation = await this.prisma.invitation.create({
      data: {
        ...base,
        kind: 'EMAIL',
        tokenHash: hashOpaqueToken(token),
        email: input.email,
        maxUses: 1,
      },
      include: {
        household: { select: { name: true } },
        createdBy: { select: { displayName: true } },
      },
    });
    await this.sendEmail(
      invitation.id,
      householdInvitationTemplate({
        to: input.email,
        inviterName: invitation.createdBy?.displayName ?? 'Someone',
        householdName: invitation.household.name,
        roleName: ROLE_NAMES[input.role],
        link: url,
      }),
    );
    return { invitation: toInvitationDto(invitation), url: null, code: null };
  }

  async list(user: AuthUser, householdId: string): Promise<InvitationDto[]> {
    await this.access.require(user, householdScope(householdId), 'member.invite');
    const invitations = await this.prisma.invitation.findMany({
      where: { householdId, ...activeInvitationWhere() },
      orderBy: { createdAt: 'desc' },
    });
    return invitations
      .filter(({ maxUses, usedCount }) => maxUses === null || usedCount < maxUses)
      .map(toInvitationDto);
  }

  async revoke(user: AuthUser, invitationId: string): Promise<void> {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, household: { members: { some: { userId: user.id } } } },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    await this.access.require(user, householdScope(invitation.householdId), 'member.invite');
    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { revokedAt: invitation.revokedAt ?? new Date() },
    });
  }

  private async assertRoomForInvitation(householdId: string): Promise<void> {
    const active = await this.prisma.invitation.count({
      where: { householdId, ...activeInvitationWhere() },
    });
    if (active >= INVITATIONS_MAX_ACTIVE) {
      throw new ConflictException('Too many open invitations. Revoke some first.');
    }
  }

  private async assertNotMember(householdId: string, email: string): Promise<void> {
    const member = await this.prisma.householdMember.findFirst({
      where: { householdId, user: { email } },
    });
    if (member) throw new ConflictException('This person is already a member');
  }

  // Without the email the invitation is useless, so it is removed again if sending fails.
  private async sendEmail(invitationId: string, message: EmailMessage): Promise<void> {
    try {
      await this.emailSender.send(message);
    } catch (error) {
      this.logger.error(`Invitation email ${invitationId} failed`, error);
      await this.prisma.invitation.deleteMany({ where: { id: invitationId } });
      throw new ServiceUnavailableException("Couldn't send the invitation email. Try again later.");
    }
  }
}
