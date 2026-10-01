import { MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { errorMessage } from '@/lib/form-errors';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { describeUserAgent } from './describe-user-agent';
import { useRevokeSession } from './use-revoke-session';
import { useSessions } from './use-sessions';

export function SessionList() {
  const sessions = useSessions();
  const revoke = useRevokeSession();

  if (sessions.isPending) {
    return <div className="h-16 animate-pulse rounded-xl bg-muted" aria-label="Loading devices" />;
  }
  if (sessions.isError) return <FormAlert tone="error">{errorMessage(sessions.error)}</FormAlert>;

  return (
    <div className="flex flex-col gap-3">
      {revoke.isError && <FormAlert tone="error">{errorMessage(revoke.error)}</FormAlert>}
      <ul className="flex flex-col divide-y divide-border">
        {sessions.data.map((session) => (
          <li key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <MonitorSmartphone className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">
                {describeUserAgent(session.userAgent)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.isCurrent
                  ? 'This device'
                  : `Active ${formatRelativeTime(session.lastUsedAt)}`}
              </span>
            </div>
            {!session.isCurrent && (
              <Button
                variant="ghost"
                className="text-danger"
                isLoading={revoke.isPending && revoke.variables === session.id}
                onClick={() => revoke.mutate(session.id)}
              >
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
