import {
  canManageRole,
  type CreatedInvitationDto,
  emailSchema,
  type InvitationKind,
  type Role,
  ROLES,
} from '@shoppy/shared';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { RadioList } from '@/components/ui/radio-list';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { ROLE_LABELS } from './role-labels';
import { useCreateInvitation } from './use-create-invitation';

const KINDS: { value: InvitationKind; label: string }[] = [
  { value: 'LINK', label: 'Share a link' },
  { value: 'CODE', label: 'Share a code' },
  { value: 'EMAIL', label: 'Invite by email' },
];

type InvitedRole = Exclude<Role, 'OWNER'>;

interface InviteFormProps {
  householdId: string;
  myRole: Role;
  onCreated: (created: CreatedInvitationDto) => void;
}

// FR-H3 / FR-H4: the role is chosen up front (only roles below the inviter's own); links and
// codes may limit their uses. Every invitation is valid for 7 days.
export function InviteForm({ householdId, myRole, onCreated }: InviteFormProps) {
  const create = useCreateInvitation(householdId);
  const roles = ROLES.filter(
    (role): role is InvitedRole => role !== 'OWNER' && canManageRole(myRole, role),
  );
  const [kind, setKind] = useState<InvitationKind>('LINK');
  const [role, setRole] = useState<InvitedRole>('MEMBER');
  const [email, setEmail] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [fieldError, setFieldError] = useState<string>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (kind === 'EMAIL') {
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) return setFieldError(parsed.error.issues[0]?.message);
      setFieldError(undefined);
      return create.mutate({ kind, role, email: parsed.data }, { onSuccess: onCreated });
    }
    const uses = maxUses ? Number(maxUses) : null;
    create.mutate({ kind, role, maxUses: uses }, { onSuccess: onCreated });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {create.error && <FormAlert tone="error">{create.error.message}</FormAlert>}
      <RadioList legend="How" options={KINDS} value={kind} onChange={setKind} />
      <SelectField
        label="Role"
        value={role}
        onChange={(event) => setRole(event.target.value as InvitedRole)}
      >
        {roles.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option]}
          </option>
        ))}
      </SelectField>
      {kind === 'EMAIL' ? (
        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          value={email}
          error={fieldError}
          onChange={(event) => setEmail(event.target.value)}
        />
      ) : (
        <SelectField
          label="Can be used"
          value={maxUses}
          onChange={(event) => setMaxUses(event.target.value)}
        >
          <option value="">Any number of times</option>
          <option value="1">Once</option>
          <option value="5">Up to 5 times</option>
        </SelectField>
      )}
      <Button type="submit" width="full" isLoading={create.isPending}>
        {kind === 'EMAIL' ? 'Send invitation' : 'Create invitation'}
      </Button>
    </form>
  );
}
