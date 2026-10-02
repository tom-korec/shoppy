import type { InvitationDto } from '@shoppy/shared';
import type { Invitation } from '../../generated/prisma/client.js';

export function toInvitationDto(invitation: Invitation): InvitationDto {
  return {
    id: invitation.id,
    kind: invitation.kind,
    role: invitation.role,
    email: invitation.email,
    maxUses: invitation.maxUses,
    usedCount: invitation.usedCount,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}
