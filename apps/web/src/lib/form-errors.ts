import type { z } from 'zod';
import { ApiError } from './api-error';

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.');
    errors[field] ??= issue.message;
  }
  return errors;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Too many attempts. Wait a while and try again.';
    if (error.status >= 500) return 'Something went wrong. Try again.';
    return error.message;
  }
  return 'Could not reach Shoppy. Check your connection.';
}
