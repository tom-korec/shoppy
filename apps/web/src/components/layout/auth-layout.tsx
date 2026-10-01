import { APP_NAME } from '@shoppy/shared';
import { ShoppingBasket } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center gap-6 px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2 text-primary">
        <ShoppingBasket className="size-7" aria-hidden />
        <span className="text-xl font-bold">{APP_NAME}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}
