import { z } from 'zod';

export function requiredNameSchema(maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, 'Enter a name')
    .max(maxLength, `Use at most ${maxLength} characters`);
}

// Blank text clears the field, so forms can send what the user typed.
export function optionalTextSchema(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Use at most ${maxLength} characters`)
    .nullable()
    .transform((value) => value || null);
}
