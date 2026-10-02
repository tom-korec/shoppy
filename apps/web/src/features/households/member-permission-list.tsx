import { type Permission, type Role, ROLE_DEFAULTS } from '@shoppy/shared';
import { CheckCircle } from '@/components/ui/check-circle';
import { grantablePermissions } from './member-overrides';
import { PERMISSION_LABELS } from './permission-labels';

interface MemberPermissionListProps {
  role: Role;
  ticked: ReadonlySet<Permission>;
  onChange: (ticked: ReadonlySet<Permission>) => void;
}

export function MemberPermissionList({ role, ticked, onChange }: MemberPermissionListProps) {
  const toggle = (permission: Permission) => {
    const next = new Set(ticked);
    if (next.has(permission)) next.delete(permission);
    else next.add(permission);
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col">
      <legend className="mb-1 text-sm font-medium">Permissions</legend>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {grantablePermissions(role).map((permission) => (
          <li key={permission} className="flex items-center pr-3">
            <CheckCircle
              label={PERMISSION_LABELS[permission]}
              isChecked={ticked.has(permission)}
              onToggle={() => toggle(permission)}
            />
            <span className="flex-1">{PERMISSION_LABELS[permission]}</span>
            {ROLE_DEFAULTS[role].has(permission) !== ticked.has(permission) && (
              <span className="text-xs text-muted-foreground">changed</span>
            )}
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
