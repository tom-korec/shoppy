import { CircleUser, House, ListChecks, type LucideIcon, Package } from 'lucide-react';

export interface NavItem {
  to: '/' | '/lists' | '/catalog' | '/profile';
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/lists', label: 'Lists', icon: ListChecks },
  { to: '/catalog', label: 'Catalog', icon: Package },
  { to: '/profile', label: 'Profile', icon: CircleUser },
];
