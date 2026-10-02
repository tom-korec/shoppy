import { z } from 'zod';
import { emailSchema } from './account-fields.js';
import { roleSchema } from './permissions.js';

export const INVITATION_DAYS_DEFAULT = 7;
export const INVITATION_MAX_USES_LIMIT = 50;
export const INVITATIONS_MAX_ACTIVE = 50;

export const invitationKindSchema = z.enum(['LINK', 'CODE', 'EMAIL']);
export type InvitationKind = z.infer<typeof invitationKindSchema>;

const invitedRoleSchema = roleSchema.exclude(['OWNER']);

export const createInvitationInputSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('LINK'),
    role: invitedRoleSchema,
    maxUses: z.number().int().min(1).max(INVITATION_MAX_USES_LIMIT).nullable().optional(),
  }),
  z.object({
    kind: z.literal('CODE'),
    role: invitedRoleSchema,
    maxUses: z.number().int().min(1).max(INVITATION_MAX_USES_LIMIT).nullable().optional(),
  }),
  z.object({ kind: z.literal('EMAIL'), role: invitedRoleSchema, email: emailSchema }),
]);
export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;

export const invitationSchema = z.object({
  id: z.uuid(),
  kind: invitationKindSchema,
  role: roleSchema,
  email: z.string().nullable(),
  maxUses: z.number().int().nullable(),
  usedCount: z.number().int(),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});
export type InvitationDto = z.infer<typeof invitationSchema>;

export const invitationListSchema = z.array(invitationSchema);

// The secret is shown once, right after creating the invitation; only its hash is stored.
export const createdInvitationSchema = z.object({
  invitation: invitationSchema,
  url: z.string().nullable(),
  code: z.string().nullable(),
});
export type CreatedInvitationDto = z.infer<typeof createdInvitationSchema>;

export const INVITE_CODE_LENGTH = 8;
// Crockford base32 without I, L, O, U: easy to read out loud and type.
export const INVITE_CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const inviteCodeSchema = z
  .string()
  .transform((code) => code.replaceAll(/[\s-]/g, '').toUpperCase())
  .pipe(
    z
      .string()
      .length(INVITE_CODE_LENGTH, 'Enter the 8-character code')
      .regex(/^[0-9A-HJKMNP-TV-Z]+$/, 'This is not a valid code'),
  );

// One of: the token from a join link, a code typed in, or an email invitation from the pending list.
export const invitationRefSchema = z.union([
  z.object({ token: z.string().min(1).max(100) }),
  z.object({ code: inviteCodeSchema }),
  z.object({ invitationId: z.uuid() }),
]);
export type InvitationRef = z.infer<typeof invitationRefSchema>;

export const invitationPreviewSchema = z.object({
  invitationId: z.uuid(),
  householdId: z.uuid(),
  householdName: z.string(),
  role: roleSchema,
  invitedBy: z.string().nullable(),
  expiresAt: z.iso.datetime(),
  isAlreadyMember: z.boolean(),
});
export type InvitationPreviewDto = z.infer<typeof invitationPreviewSchema>;

export const pendingInvitationListSchema = z.array(invitationPreviewSchema);
