import type { Prisma } from '../../generated/prisma/client.js';

// Not revoked, declined or expired. Use counts are checked separately (a column comparison).
export function activeInvitationWhere(now = new Date()): Prisma.InvitationWhereInput {
  return { revokedAt: null, declinedAt: null, expiresAt: { gt: now } };
}

export function hasUsesLeft(invitation: { maxUses: number | null; usedCount: number }): boolean {
  return invitation.maxUses === null || invitation.usedCount < invitation.maxUses;
}
