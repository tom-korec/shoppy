import { z } from 'zod';

export const signInSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const emailLinkSearchSchema = z.object({
  token: z.string().optional(),
});
