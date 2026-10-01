// Loaded via `node --import` before the app so Sentry can instrument modules as they load.
import * as Sentry from '@sentry/nestjs';

const dsn = process.env['SENTRY_DSN'];

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    release: process.env['APP_VERSION'],
    tracesSampleRate: 0.1,
  });
}
