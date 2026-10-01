import { Link } from '@tanstack/react-router';
import { CircleUser, House, ListChecks, type LucideIcon } from 'lucide-react';

interface NavItem {
  to: '/' | '/lists' | '/profile';
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: House },
  { to: '/lists', label: 'Lists', icon: ListChecks },
  { to: '/profile', label: 'Profile', icon: CircleUser },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === '/' }}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
              activeProps={{ className: 'text-primary font-medium', 'aria-current': 'page' }}
            >
              <Icon className="size-6" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
