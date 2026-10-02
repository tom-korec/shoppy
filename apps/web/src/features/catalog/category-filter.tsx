import type { CategoryDto } from '@shoppy/shared';
import { useId } from 'react';
import type { CategoryFilterValue } from './filter-items';

interface CategoryFilterProps {
  categories: CategoryDto[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  const name = useId();
  const options = [
    { value: 'all', label: 'All' },
    ...categories.map(({ id, name: label }) => ({ value: id, label })),
    { value: 'uncategorized', label: 'No category' },
  ];

  return (
    <fieldset className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
      <legend className="sr-only">Filter by category</legend>
      {options.map((option) => (
        <label key={option.value} className="relative shrink-0 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
          />
          <span className="flex min-h-9 items-center rounded-full border border-border bg-card px-3 text-sm whitespace-nowrap peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-primary lg:min-h-10 lg:rounded-xl lg:border-transparent lg:bg-transparent lg:whitespace-normal lg:hover:bg-muted lg:peer-checked:border-transparent lg:peer-checked:bg-primary/10 lg:peer-checked:font-medium lg:peer-checked:text-primary">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
