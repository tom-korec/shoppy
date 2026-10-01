import { Check } from 'lucide-react';

// Styled from the sibling checkbox's state (`peer`).
export function CheckMark() {
  return (
    <span className="flex size-6 items-center justify-center rounded-full border-2 border-muted-foreground/50 text-transparent peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
      <Check className="size-4" strokeWidth={3} aria-hidden />
    </span>
  );
}
