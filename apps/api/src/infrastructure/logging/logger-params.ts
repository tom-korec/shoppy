import { RequestMethod } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import type { Env } from '../../config/env.js';

const GCP_SEVERITY: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

export function loggerParams(env: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>): Params {
  const isDev = env.NODE_ENV === 'development';

  return {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
    pinoHttp: {
      level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
      transport: isDev ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
      // Cloud Logging reads `message` and `severity` from structured JSON logs.
      messageKey: isDev ? 'msg' : 'message',
      formatters: isDev
        ? undefined
        : { level: (label) => ({ severity: GCP_SEVERITY[label] ?? 'DEFAULT' }) },
      serializers: {
        req: (req: { id: string; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    },
  };
}
