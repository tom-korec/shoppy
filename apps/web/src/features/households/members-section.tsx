import { canManageRole, type HouseholdDto, type MemberDto } from '@shoppy/shared';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { QueryState } from '@/components/ui/query-state';
import { Section } from '@/components/ui/section';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { MemberSheet } from './member-sheet';
import { ROLE_LABELS } from './role-labels';
import { useMembers } from './use-members';

const MANAGING = ['member.changeRole', 'member.editPermissions', 'member.remove'] as const;

interface MembersSectionProps {
  household: HouseholdDto;
}

export function MembersSection({ household }: MembersSectionProps) {
  const members = useMembers(household.id);
  const me = useCurrentUser();
  const [open, setOpen] = useState<MemberDto>();
  const managesMembers = MANAGING.some((permission) =>
    household.myPermissions.includes(permission),
  );
  const canManage = (member: MemberDto) =>
    managesMembers && member.userId !== me.id && canManageRole(household.myRole, member.role);

  return (
    <Section title="Members">
      <QueryState query={members}>
        {(data) => (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {data.map((member) => {
              const label = (
                <>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {member.displayName}
                      {member.userId === me.id && ' (you)'}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">{member.email}</span>
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {ROLE_LABELS[member.role]}
                  </span>
                </>
              );
              return (
                <li key={member.id}>
                  {canManage(member) ? (
                    <button
                      type="button"
                      onClick={() => setOpen(member)}
                      className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
                    >
                      {label}
                      <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                    </button>
                  ) : (
                    <div className="flex min-h-14 items-center gap-3 px-4">{label}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </QueryState>
      <MemberSheet
        member={open}
        myRole={household.myRole}
        myPermissions={household.myPermissions}
        onClose={() => setOpen(undefined)}
      />
    </Section>
  );
}
