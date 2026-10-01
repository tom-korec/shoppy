import type { UserDto } from '@shoppy/shared';
import type { Prisma } from '../../generated/prisma/client.js';

export const USER_DTO_INCLUDE = {
  identities: { select: { provider: true } },
} satisfies Prisma.UserInclude;

type UserWithIdentities = Prisma.UserGetPayload<{ include: typeof USER_DTO_INCLUDE }>;

export function toUserDto(user: UserWithIdentities): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isEmailVerified: user.emailVerifiedAt !== null,
    hasPassword: user.passwordHash !== null,
    hasGoogle: user.identities.some((identity) => identity.provider === 'GOOGLE'),
  };
}
