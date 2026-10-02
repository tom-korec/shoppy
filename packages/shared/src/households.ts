import { z } from 'zod';
import { permissionSchema, roleSchema } from './permissions.js';
import { requiredNameSchema } from './text-fields.js';

export const HOUSEHOLD_NAME_MAX_LENGTH = 50;
export const HOUSEHOLDS_MAX_PER_USER = 20;
export const MEMBERS_MAX_PER_HOUSEHOLD = 50;

export const householdSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  memberCount: z.number().int(),
  myRole: roleSchema,
  myPermissions: z.array(permissionSchema),
});
export type HouseholdDto = z.infer<typeof householdSchema>;

export const householdListSchema = z.array(householdSchema);

export const householdInputSchema = z.object({
  name: requiredNameSchema(HOUSEHOLD_NAME_MAX_LENGTH),
});
export type HouseholdInput = z.infer<typeof householdInputSchema>;

export const permissionOverrideSchema = z.object({
  permission: permissionSchema,
  isGranted: z.boolean(),
});

export const memberSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  displayName: z.string(),
  email: z.string(),
  role: roleSchema,
  overrides: z.array(permissionOverrideSchema),
  permissions: z.array(permissionSchema),
  joinedAt: z.iso.datetime(),
});
export type MemberDto = z.infer<typeof memberSchema>;

export const memberListSchema = z.array(memberSchema);

// A new role (never Owner: ownership moves only by transfer) and/or the complete set of overrides.
export const updateMemberInputSchema = z.object({
  role: roleSchema.exclude(['OWNER']).optional(),
  overrides: z
    .array(permissionOverrideSchema)
    .max(50)
    .refine(
      (overrides) =>
        new Set(overrides.map(({ permission }) => permission)).size === overrides.length,
      'Each permission may appear only once',
    )
    .optional(),
});
export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;

export const transferOwnershipInputSchema = z.object({ memberId: z.uuid() });
export type TransferOwnershipInput = z.infer<typeof transferOwnershipInputSchema>;
