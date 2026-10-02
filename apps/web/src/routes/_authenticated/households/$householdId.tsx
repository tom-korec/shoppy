import { createFileRoute } from '@tanstack/react-router';
import { HouseholdPage } from '@/features/households/household-page';
import { householdRouteParams } from '@/features/households/household-route-params';

export const Route = createFileRoute('/_authenticated/households/$householdId')({
  params: householdRouteParams,
  component: HouseholdPage,
});
