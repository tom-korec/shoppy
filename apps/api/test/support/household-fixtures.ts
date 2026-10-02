import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  createdInvitationSchema,
  type HouseholdDto,
  householdSchema,
  memberListSchema,
  type Role,
} from '@shoppy/shared';
import { registerUser, type RegisteredUser } from './auth-fixtures.js';
import { apiAs, parseOk } from './shopping-fixtures.js';

export interface HouseholdMemberUser extends RegisteredUser {
  memberId: string;
}

export async function createHousehold(
  app: NestFastifyApplication,
  owner: RegisteredUser,
  name = 'Home',
): Promise<HouseholdDto> {
  return parseOk(await apiAs(app, owner)('POST', '/households', { name }), householdSchema);
}

export async function inviteLink(
  app: NestFastifyApplication,
  inviter: RegisteredUser,
  householdId: string,
  role: Exclude<Role, 'OWNER'> = 'MEMBER',
  maxUses?: number,
): Promise<string> {
  const created = parseOk(
    await apiAs(app, inviter)('POST', `/households/${householdId}/invitations`, {
      kind: 'LINK',
      role,
      ...(maxUses && { maxUses }),
    }),
    createdInvitationSchema,
  );
  return new URL(created.url ?? '').pathname.split('/').at(-1) ?? '';
}

// A new user who joined the household with the given role through a link invitation.
export async function addMember(
  app: NestFastifyApplication,
  owner: RegisteredUser,
  householdId: string,
  role: Role,
): Promise<HouseholdMemberUser> {
  const user = await registerUser(app);
  const invitedRole = role === 'OWNER' ? 'ADMIN' : role;
  const token = await inviteLink(app, owner, householdId, invitedRole);
  parseOk(await apiAs(app, user)('POST', '/invitations/accept', { token }), householdSchema);

  const members = parseOk(
    await apiAs(app, owner)('GET', `/households/${householdId}/members`),
    memberListSchema,
  );
  const memberId = members.find(({ userId }) => userId === user.user.id)?.id ?? '';
  return { ...user, memberId };
}
