import { Link } from '@tanstack/react-router';
import { Page } from '@/components/ui/page';

export function NotFoundPage() {
  return (
    <Page title="Not found">
      <p className="text-muted-foreground">This page doesn't exist.</p>
      <Link to="/" className="font-medium text-primary">
        Go home
      </Link>
    </Page>
  );
}
