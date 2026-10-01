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
    <fieldset className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
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
          <span className="flex min-h-9 items-center rounded-full border border-border bg-card px-3 text-sm whitespace-nowrap peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
