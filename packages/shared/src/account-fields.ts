import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
// Bounded so oversized request bodies can't be used to burn CPU on hashing.
export const PASSWORD_MAX_LENGTH = 128;

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a digit');

export const DISPLAY_NAME_MAX_LENGTH = 50;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter your name')
  .max(DISPLAY_NAME_MAX_LENGTH);
