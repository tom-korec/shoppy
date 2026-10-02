import { useState } from 'react';

// Multi-select mode: `selected` is null while not selecting.
export function useSelection() {
  const [selected, setSelected] = useState<ReadonlySet<string> | null>(null);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    isSelecting: selected !== null,
    selectedIds: [...(selected ?? [])],
    isSelected: (id: string) => selected?.has(id) ?? false,
    start: () => setSelected(new Set()),
    stop: () => setSelected(null),
    toggle,
  };
}

export type Selection = ReturnType<typeof useSelection>;
