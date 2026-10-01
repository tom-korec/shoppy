import { createFileRoute } from '@tanstack/react-router';
import { ListsPage } from '@/features/lists/lists-page';

export const Route = createFileRoute('/lists')({
  component: ListsPage,
});
