import { ConflictException } from '@nestjs/common';
import type { EntryDto } from '@shoppy/shared';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { accessibleBy } from '../../common/scope/scope.js';
import type { DbClient } from '../../infrastructure/prisma/db-client.js';
import { ENTRY_DTO_INCLUDE, toEntryDto } from './entry-dto.js';

// A retried request with a client-chosen id gets the entry it created before. Any other use of
// a taken id gets the same answer whoever owns it, so ids of other people's entries don't leak.
export async function findExistingEntry(
  db: DbClient,
  user: AuthUser,
  listId: string,
  id: string,
): Promise<EntryDto> {
  const entry = await db.listEntry.findFirst({
    where: { id, listId, list: accessibleBy(user) },
    include: ENTRY_DTO_INCLUDE,
  });
  if (!entry) throw new ConflictException('This entry id is already used');
  return toEntryDto(entry);
}
