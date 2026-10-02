import { useId } from 'react';

interface SwitchFieldProps {
  label: string;
  hint?: string;
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}

export function SwitchField({ label, hint, isOn, onChange }: SwitchFieldProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      </label>
      <span className="relative flex h-11 w-14 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={isOn}
          checked={isOn}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
        />
        <span className="h-7 w-12 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
        <span className="pointer-events-none absolute left-1 size-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </div>
  );
}
