import { ListChecks } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';

export function ListsPage() {
  return (
    <Page title="Lists">
      <EmptyState icon={ListChecks} title="No lists yet">
        Your personal and household lists will appear here.
      </EmptyState>
    </Page>
  );
}
