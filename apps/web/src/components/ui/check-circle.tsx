import { CheckMark } from './check-mark';

interface CheckCircleProps {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}

export function CheckCircle({ label, isChecked, onToggle }: CheckCircleProps) {
  return (
    <label className="relative flex size-11 shrink-0 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        aria-label={label}
        checked={isChecked}
        onChange={onToggle}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
      />
      <CheckMark />
    </label>
  );
}
