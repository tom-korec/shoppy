import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormAlertProps {
  tone: 'error' | 'success';
  children: ReactNode;
}

export function FormAlert({ tone, children }: FormAlertProps) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
        tone === 'error' ? 'border-danger/40 text-danger' : 'border-success/40 text-success',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
