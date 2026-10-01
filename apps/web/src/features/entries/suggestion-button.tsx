import type { ReactNode } from 'react';

interface SuggestionButtonProps {
  onPick: () => void;
  children: ReactNode;
}

// mousedown is cancelled so the input keeps focus (and the phone keyboard stays open).
export function SuggestionButton({ onPick, children }: SuggestionButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPick}
      className="flex min-h-11 w-full items-center gap-2 px-3 text-left hover:bg-muted"
    >
      {children}
    </button>
  );
}
