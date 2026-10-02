import { useId } from 'react';
import { type ScopeKey, scopeFromId, scopeId } from './scope-key';
import { useHouseholds } from './use-households';

interface ScopeSwitcherProps {
  label: string;
  value: ScopeKey;
  onChange: (scope: ScopeKey) => void;
}

// Personal or one of the user's households; hidden until the user is in a household.
export function ScopeSwitcher({ label, value, onChange }: ScopeSwitcherProps) {
  const households = useHouseholds();
  const id = useId();
  if (!households.data?.length) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={scopeId(value)}
        onChange={(event) => onChange(scopeFromId(event.target.value))}
        className="min-h-11 flex-1 rounded-xl border border-border bg-card px-3 text-base font-medium"
      >
        <option value="personal">Personal</option>
        {households.data.map((household) => (
          <option key={household.id} value={household.id}>
            {household.name}
          </option>
        ))}
      </select>
    </div>
  );
}
