import { APP_VERSION } from './app-version';

// Loaded after the first render, so the SDK stays off the critical path of a cold start; errors
// in the first moments of a page load are not reported.
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  import('@sentry/react')
    .then((Sentry) =>
      Sentry.init({
        dsn,
        release: APP_VERSION,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1,
      }),
    )
    .catch((error: unknown) => console.error('Error tracking failed to load', error));
}
