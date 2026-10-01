import { z } from 'zod';

const emptyAsUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    APP_VERSION: z.string().default('dev'),
    APP_URL: z.url().default('http://localhost:5180'),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    SENTRY_DSN: emptyAsUndefined(z.url()),
    PROXY_SECRET: emptyAsUndefined(z.string().min(32)),
    JWT_SECRET: z.string().min(32),
    RESEND_API_KEY: emptyAsUndefined(z.string().min(1)),
    EMAIL_FROM: z.string().default('Shoppy <noreply@shoppy.korec.dev>'),
    GOOGLE_CLIENT_ID: emptyAsUndefined(z.string().min(1)),
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.RESEND_API_KEY, {
    // Without email nobody can verify an account, so production must not start silently broken.
    message: 'RESEND_API_KEY is required in production',
    path: ['RESEND_API_KEY'],
  })
  .refine((env) => env.NODE_ENV !== 'production' || env.PROXY_SECRET, {
    // Without it the public Cloud Run URL accepts forged X-Forwarded-For and skips the IP limits.
    message: 'PROXY_SECRET is required in production',
    path: ['PROXY_SECRET'],
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
