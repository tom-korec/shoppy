import type { UseQueryResult } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './button';
import { FormAlert } from './form-alert';

interface QueryStateProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}

// Loading and error states for a page section; children render once data is there.
export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  if (query.isSuccess) return children(query.data);
  if (query.isError) {
    return (
      <div className="flex flex-col gap-3">
        <FormAlert tone="error">{query.error.message}</FormAlert>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-center py-8" aria-label="Loading">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}
