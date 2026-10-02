import { Clock, Mail, Star } from 'lucide-react';
import { ColumnFlow } from '@/components/ui/column-flow';
import { EmptyState } from '@/components/ui/empty-state';
import { Page } from '@/components/ui/page';
import { Section } from '@/components/ui/section';

export function DashboardPage() {
  return (
    <Page title="Shoppy" width="wide">
      <ColumnFlow>
        <Section title="Favorites">
          <EmptyState icon={Star} title="No favorite lists yet">
            Star a list to pin it here.
          </EmptyState>
        </Section>
        <Section title="Recently used">
          <EmptyState icon={Clock} title="Nothing here yet">
            Lists you open will show up here.
          </EmptyState>
        </Section>
        <Section title="Invitations">
          <EmptyState icon={Mail} title="No pending invitations" />
        </Section>
      </ColumnFlow>
    </Page>
  );
}
