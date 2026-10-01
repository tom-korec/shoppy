export interface CategorySeed {
  name: string;
  icon: string;
}

// Seeded into every new personal scope (FR-C1) and household (FR-C2), in shop walking order.
export const DEFAULT_CATEGORIES: readonly CategorySeed[] = [
  { name: 'Fruit & vegetables', icon: 'apple' },
  { name: 'Bakery', icon: 'croissant' },
  { name: 'Dairy & eggs', icon: 'milk' },
  { name: 'Meat & fish', icon: 'beef' },
  { name: 'Pantry & frozen', icon: 'wheat' },
  { name: 'Drinks', icon: 'cup-soda' },
  { name: 'Household & care', icon: 'spray-can' },
  { name: 'Other', icon: 'shopping-basket' },
];
