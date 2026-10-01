import { notFound } from '@tanstack/react-router';
import { z } from 'zod';

const listIdSchema = z.uuid();

// The list id goes into API paths; a crafted link such as `/lists/..%2Fauth%2Flogout` must not
// steer those requests elsewhere.
export const listRouteParams = {
  parse: ({ listId }: { listId: string }) => {
    const result = listIdSchema.safeParse(listId);
    if (!result.success) throw notFound();
    return { listId: result.data };
  },
  stringify: ({ listId }: { listId: string }) => ({ listId }),
};
