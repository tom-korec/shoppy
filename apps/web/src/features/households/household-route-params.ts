import { notFound } from '@tanstack/react-router';
import { z } from 'zod';

const householdIdSchema = z.uuid();

// The id goes into API paths, so only a UUID is accepted (like list ids).
export const householdRouteParams = {
  parse: ({ householdId }: { householdId: string }) => {
    const result = householdIdSchema.safeParse(householdId);
    if (!result.success) throw notFound();
    return { householdId: result.data };
  },
  stringify: ({ householdId }: { householdId: string }) => ({ householdId }),
};
