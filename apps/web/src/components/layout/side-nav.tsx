import { APP_NAME } from '@shoppy/shared';
import { Link } from '@tanstack/react-router';
import { ShoppingBasket } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';

export function SideNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col gap-6 border-r border-border bg-card px-3 py-6 lg:flex"
    >
      <Link to="/" className="flex items-center gap-2 px-3 text-primary">
        <ShoppingBasket className="size-7" aria-hidden />
        <span className="text-xl font-bold">{APP_NAME}</span>
      </Link>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === '/' }}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{
                className: 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
                'aria-current': 'page',
              }}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
