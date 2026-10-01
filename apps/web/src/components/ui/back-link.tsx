import { Link, type LinkProps } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

interface BackLinkProps {
  to: LinkProps['to'];
  params?: LinkProps['params'];
  label: string;
}

export function BackLink({ to, params, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      aria-label={label}
      className="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
    >
      <ChevronLeft className="size-6" aria-hidden />
    </Link>
  );
}
