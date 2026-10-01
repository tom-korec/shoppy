import { z } from 'zod';

export const sessionSchema = z.object({
  id: z.uuid(),
  userAgent: z.string().nullable(),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime(),
  isCurrent: z.boolean(),
});
export type SessionDto = z.infer<typeof sessionSchema>;

export const sessionListSchema = z.array(sessionSchema);
