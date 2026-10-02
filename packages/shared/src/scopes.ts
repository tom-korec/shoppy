import { z } from 'zod';

// Where a list or catalog belongs, as shown in the app.
export const scopeRefSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('personal') }),
  z.object({ kind: z.literal('household'), householdId: z.uuid(), householdName: z.string() }),
]);
export type ScopeRef = z.infer<typeof scopeRefSchema>;
