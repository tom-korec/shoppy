import {
  canManageRole,
  type MemberDto,
  type Permission,
  type Role,
  ROLE_DEFAULTS,
  ROLES,
} from '@shoppy/shared';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { FormAlert } from '@/components/ui/form-alert';
import { SelectField } from '@/components/ui/select-field';
import { MemberPermissionList } from './member-permission-list';
import { overridesFor } from './member-overrides';
import { ROLE_LABELS } from './role-labels';
import { useRemoveMember } from './use-remove-member';
import { useUpdateMember } from './use-update-member';

interface MemberEditorProps {
  member: MemberDto;
  myRole: Role;
  myPermissions: readonly Permission[];
  onClose: () => void;
}

// FR-R6: roles below the editor's own; permissions within the role's ceiling (FR-R4). A new
// role starts from its own defaults.
export function MemberEditor({ member, myRole, myPermissions, onClose }: MemberEditorProps) {
  const update = useUpdateMember();
  const remove = useRemoveMember();
  const [role, setRole] = useState<Role>(member.role);
  const [ticked, setTicked] = useState<ReadonlySet<Permission>>(new Set(member.permissions));
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const canChangeRole = myPermissions.includes('member.changeRole');
  const canEditPermissions = myPermissions.includes('member.editPermissions');
  const roles = ROLES.filter((option) => option !== 'OWNER' && canManageRole(myRole, option));

  const changeRole = (next: Role) => {
    setRole(next);
    setTicked(new Set(ROLE_DEFAULTS[next]));
  };

  const save = () => {
    update.mutate(
      {
        memberId: member.id,
        input: {
          ...(canChangeRole && role !== member.role && { role: role as Exclude<Role, 'OWNER'> }),
          ...(canEditPermissions && { overrides: overridesFor(role, ticked) }),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="-mt-2 text-sm text-muted-foreground">{member.email}</p>
      {update.error && <FormAlert tone="error">{update.error.message}</FormAlert>}
      {canChangeRole && (
        <SelectField
          label="Role"
          value={role}
          onChange={(event) => changeRole(event.target.value as Role)}
        >
          {roles.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </SelectField>
      )}
      {canEditPermissions && (
        <MemberPermissionList role={role} ticked={ticked} onChange={setTicked} />
      )}
      <Button width="full" isLoading={update.isPending} onClick={save}>
        Save
      </Button>
      {myPermissions.includes('member.remove') && (
        <Button variant="danger" width="full" onClick={() => setIsConfirmingRemove(true)}>
          <Trash2 className="size-4" aria-hidden />
          Remove from household
        </Button>
      )}
      <ConfirmSheet
        isOpen={isConfirmingRemove}
        title={`Remove ${member.displayName}?`}
        confirmLabel="Remove"
        isDanger
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(member.id, { onSuccess: onClose })}
        onClose={() => setIsConfirmingRemove(false)}
      >
        They lose access to the household's lists. What they bought stays in the history.
      </ConfirmSheet>
    </div>
  );
}
