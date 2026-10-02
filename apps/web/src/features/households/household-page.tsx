import { getRouteApi } from '@tanstack/react-router';
import { BackLink } from '@/components/ui/back-link';
import { ColumnFlow } from '@/components/ui/column-flow';
import { Page } from '@/components/ui/page';
import { QueryState } from '@/components/ui/query-state';
import { HouseholdSettings } from './household-settings';
import { InvitationsSection } from './invitations-section';
import { MembersSection } from './members-section';
import { ROLE_LABELS } from './role-labels';
import { useHousehold } from './use-household';

const route = getRouteApi('/_authenticated/households/$householdId');

export function HouseholdPage() {
  const { householdId } = route.useParams();
  const household = useHousehold(householdId);

  return (
    <Page
      title={household.data?.name ?? 'Household'}
      width="wide"
      leading={<BackLink to="/profile" label="Back to profile" />}
    >
      <QueryState query={household}>
        {(data) => (
          <>
            <p className="-mt-4 text-muted-foreground">
              You're {ROLE_LABELS[data.myRole].toLowerCase()} here.
            </p>
            <ColumnFlow>
              <MembersSection household={data} />
              {data.myPermissions.includes('member.invite') && (
                <InvitationsSection household={data} />
              )}
              <HouseholdSettings household={data} />
            </ColumnFlow>
          </>
        )}
      </QueryState>
    </Page>
  );
}
