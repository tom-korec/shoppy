import { ICON_KEYS, type IconKey } from '@shoppy/shared';
import { useId } from 'react';
import { AppIcon } from './app-icon';

interface IconPickerProps {
  label: string;
  value: string;
  onChange: (icon: IconKey) => void;
}

export function IconPicker({ label, value, onChange }: IconPickerProps) {
  const name = useId();
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-7 gap-1.5">
        {ICON_KEYS.map((icon) => (
          <label key={icon} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={icon}
              aria-label={icon.replaceAll('-', ' ')}
              checked={icon === value}
              onChange={() => onChange(icon)}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            />
            <span className="flex aspect-square min-h-11 items-center justify-center rounded-xl border border-transparent bg-muted text-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
              <AppIcon name={icon} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
