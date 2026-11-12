import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Button } from './button';
import { FormAlert } from './form-alert';
import { SkeletonList } from './skeleton-list';

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
  return <SkeletonList />;
}
