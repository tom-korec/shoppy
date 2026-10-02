import { z } from 'zod';

// `?scope=personal` or `?scope=<household id>` on the Catalog and Categories screens.
export const scopeSearchSchema = z.object({
  scope: z
    .union([z.literal('personal'), z.uuid()])
    .optional()
    .catch(undefined),
});
