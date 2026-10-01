import type { EntryDto } from '@shoppy/shared';
import type { ReactNode } from 'react';
import { AppIcon } from '@/components/ui/app-icon';
import type { EntryGroup } from './group-entries';

interface EntryGroupsProps {
  groups: EntryGroup[];
  renderEntry: (entry: EntryDto) => ReactNode;
}

export function EntryGroups({ groups, renderEntry }: EntryGroupsProps) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ key, category, entries }) => (
        <section key={key} aria-label={category?.name ?? 'No category'}>
          <h2 className="flex items-center gap-2 px-1 pb-1 text-sm font-semibold text-muted-foreground">
            <AppIcon name={category?.icon ?? 'tag'} className="size-4" />
            {category?.name ?? 'No category'}
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {entries.map(renderEntry)}
          </ul>
        </section>
      ))}
    </div>
  );
}
