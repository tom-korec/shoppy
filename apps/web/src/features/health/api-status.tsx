import { cn } from '@/lib/cn';
import { useHealth } from './use-health';

const LABELS = {
  checking: 'Checking…',
  unreachable: 'Unreachable',
  ok: 'Online',
  degraded: 'Degraded',
} as const;

export function ApiStatus() {
  const { data, isPending, isError } = useHealth();
  const state = isPending ? 'checking' : isError ? 'unreachable' : data.status;

  return (
    <output className="flex items-center gap-2 text-sm" aria-live="polite">
      <span
        aria-hidden
        className={cn('size-2.5 rounded-full', {
          'animate-pulse bg-muted-foreground': state === 'checking',
          'bg-success': state === 'ok',
          'bg-warning': state === 'degraded',
          'bg-danger': state === 'unreachable',
        })}
      />
      <span>
        API: <span className="font-medium">{LABELS[state]}</span>
      </span>
      {data && <span className="text-muted-foreground">· {data.version}</span>}
    </output>
  );
}
