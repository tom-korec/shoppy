import type { InvitationDto } from '@shoppy/shared';
import { KeyRound, Link2, Mail, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { ROLE_LABELS } from './role-labels';

const KIND_ICONS = { LINK: Link2, CODE: KeyRound, EMAIL: Mail } as const;
const dateFormatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' });

interface InvitationRowProps {
  invitation: InvitationDto;
  onRevoke: () => void;
}

export function InvitationRow({ invitation, onRevoke }: InvitationRowProps) {
  const Icon = KIND_ICONS[invitation.kind];
  const uses = invitation.maxUses
    ? `${invitation.usedCount}/${invitation.maxUses} used`
    : `${invitation.usedCount} used`;
  return (
    <li className="flex items-center gap-3 pl-4">
      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col py-2">
        <span className="truncate">
          {invitation.email ?? (invitation.kind === 'LINK' ? 'Link' : 'Code')}
        </span>
        <span className="text-sm text-muted-foreground">
          {ROLE_LABELS[invitation.role]} · {uses} · until{' '}
          {dateFormatter.format(new Date(invitation.expiresAt))}
        </span>
      </span>
      <IconButton icon={X} label="Revoke invitation" onClick={onRevoke} />
    </li>
  );
}
