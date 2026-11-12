import type { ListDto } from '@shoppy/shared';
import { ListCard } from '@/features/lists/list-card';
import { useHouseholds } from '@/features/households/use-households';

interface ListCardListProps {
  lists: ListDto[];
  label: string;
}

// The household badge only helps once the user is in a household.
export function ListCardList({ lists, label }: ListCardListProps) {
  const households = useHouseholds();
  const showsScope = Boolean(households.data?.length);
  return (
    <ul className="flex flex-col gap-2" aria-label={label}>
      {lists.map((list) => (
        <ListCard key={list.id} list={list} showsScope={showsScope} />
      ))}
    </ul>
  );
}
