import { ConflictException } from '@nestjs/common';
import { isUniqueViolation } from './is-unique-violation.js';

export function rethrowUniqueViolation(message: string): (error: unknown) => never {
  return (error: unknown) => {
    if (isUniqueViolation(error)) throw new ConflictException(message);
    throw error;
  };
}
