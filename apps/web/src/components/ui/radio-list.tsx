import { useId } from 'react';
import { CheckMark } from './check-mark';

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioListProps<T extends string> {
  legend: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioList<T extends string>({
  legend,
  options,
  value,
  onChange,
}: RadioListProps<T>) {
  const name = useId();
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="relative flex min-h-11 cursor-pointer items-center gap-3"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
          />
          <CheckMark />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
