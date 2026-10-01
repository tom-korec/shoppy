import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// Bottom sheet on a native modal <dialog>: focus trap and Escape come for free. The dialog fills
// the screen so a tap beside the panel lands on the transparent backdrop button.
export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        // Only a close by the user (Escape) is reported; closing because `isOpen` turned false
        // must not reset the parent, which may be opening another sheet.
        if (isOpen) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-foreground backdrop:bg-overlay"
    >
      {isOpen && (
        <div className="flex h-full flex-col justify-end sm:justify-center">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative mx-auto flex max-h-[90dvh] w-full flex-col gap-4 overflow-y-auto rounded-t-3xl bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-3xl">
            <header className="flex items-center justify-between gap-2">
              <h2 id={titleId} className="truncate text-lg font-semibold">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>
            {children}
          </div>
        </div>
      )}
    </dialog>
  );
}
