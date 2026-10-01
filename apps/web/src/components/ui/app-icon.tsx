import { iconKeySchema } from '@shoppy/shared';
import { ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ICON_COMPONENTS } from './icon-components';

interface AppIconProps {
  name: string;
  className?: string;
}

// Icon keys come from the API; one dropped from the curated set falls back to a basket.
export function AppIcon({ name, className }: AppIconProps) {
  const key = iconKeySchema.safeParse(name);
  const Icon = key.success ? ICON_COMPONENTS[key.data] : ShoppingBasket;
  return <Icon className={cn('size-5', className)} aria-hidden />;
}
