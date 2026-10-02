import { createFileRoute } from '@tanstack/react-router';
import { JoinPage } from '@/features/households/join-page';

export const Route = createFileRoute('/_authenticated/join/$token')({
  component: JoinPage,
});
