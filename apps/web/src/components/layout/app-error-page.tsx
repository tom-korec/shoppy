import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/form-errors';
import { AuthLayout } from './auth-layout';

export function AppErrorPage({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <AuthLayout title="Shoppy can't load right now" subtitle={errorMessage(error)}>
      <CloudOff className="size-12 self-center text-muted-foreground" aria-hidden />
      <Button width="full" onClick={() => void router.invalidate()}>
        Try again
      </Button>
    </AuthLayout>
  );
}
