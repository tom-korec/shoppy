import { ConflictException } from '@nestjs/common';

// A move (check, restore) reads rows and then deletes them. If a parallel request deleted some
// of them first, fail so the transaction rolls back instead of writing duplicates.
export function assertDeletedAll(deleted: number, expected: number): void {
  if (deleted !== expected) {
    throw new ConflictException('The list changed in the meantime. Try again.');
  }
}
