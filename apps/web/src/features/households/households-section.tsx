import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronRight, House, KeyRound, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { CreateHouseholdSheet } from './create-household-sheet';
import { JoinWithCodeSheet } from './join-with-code-sheet';
import { PendingInvitations } from './pending-invitations';
import { ROLE_LABELS } from './role-labels';
import { useHouseholds } from './use-households';

export function HouseholdsSection() {
  const households = useHouseholds();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<'create' | 'join' | null>(null);

  return (
    <Section title="Households">
      <PendingInvitations />
      {households.data && households.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {households.data.map((household) => (
            <li key={household.id}>
              <Link
                to="/households/$householdId"
                params={{ householdId: household.id }}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card px-4"
              >
                <House className="size-5 text-muted-foreground" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{household.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {ROLE_LABELS[household.myRole]} · {household.memberCount}{' '}
                    {household.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => setDialog('create')}>
          <Plus className="size-4" aria-hidden />
          New household
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setDialog('join')}>
          <KeyRound className="size-4" aria-hidden />
          Join with code
        </Button>
      </div>
      <CreateHouseholdSheet
        isOpen={dialog === 'create'}
        onCreated={(household) => {
          setDialog(null);
          void navigate({ to: '/households/$householdId', params: { householdId: household.id } });
        }}
        onClose={() => setDialog(null)}
      />
      <JoinWithCodeSheet isOpen={dialog === 'join'} onClose={() => setDialog(null)} />
    </Section>
  );
}
