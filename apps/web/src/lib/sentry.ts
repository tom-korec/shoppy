import * as Sentry from '@sentry/react';
import { APP_VERSION } from './app-version';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    release: APP_VERSION,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}
